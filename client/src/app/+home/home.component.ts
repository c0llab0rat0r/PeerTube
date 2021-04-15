import { buildVideoLink, buildVideoOrPlaylistEmbed } from 'src/assets/player/utils'
import { environment } from 'src/environments/environment'
import { DOCUMENT } from '@angular/common'
import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Inject,
  Injector,
  OnChanges,
  OnInit,
  SimpleChange,
  SimpleChanges,
  Type
} from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { MarkdownService } from '@app/core'
import { ButtonComponent, DateToggleComponent } from '@app/shared/shared-main'

@Component({
  templateUrl: './home.component.html',
  styleUrls: [ './home.component.scss' ]
})

export class HomeComponent implements OnInit {
  html: SafeHtml

  constructor (
    @Inject(DOCUMENT) private document: Document,
    private injector: Injector,
    private applicationRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private markdown: MarkdownService,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit () {
    const text = `
    <div>
      <strong>hello</strong> *hihi*
      <peertube-button></peertube-button>
      <peertube-embed data-uuid="164f423c-ebed-4f84-9162-af5f311705da"></peertube-embed>
      <peertube-date></peertube-date>
    </div>
    `

    const html = await this.markdown.completeMarkdownToHTML(text)

    const rootElement = this.document.createElement('div')
    rootElement.innerHTML = html

    rootElement.querySelectorAll('peertube-button')
      .forEach(e => {
        const { component, wrapper } = this.createElement(ButtonComponent)

        this.setModel(component, { loading: true, label: 'toto' })

        this.injectElement(e, component, wrapper)
      })

    rootElement.querySelectorAll('peertube-date')
      .forEach(e => {
        const { component, wrapper } = this.createElement(DateToggleComponent)

        this.setModel(component, { date: new Date() })

        this.injectElement(e, component, wrapper)
      })

    rootElement.querySelectorAll('peertube-embed')
      .forEach((e: HTMLElement) => {
        const embed = this.buildEmbed(e)

        e.replaceWith(embed)
      })

    this.html = this.sanitizer.bypassSecurityTrustHtml(rootElement.innerHTML)
  }

  private buildEmbed (inEmbed: HTMLElement) {
    const data = inEmbed.dataset
    const wrapper = this.document.createElement('div')

    const link = buildVideoLink({
      baseUrl: `${environment.originServerUrl}/videos/embed/${data.uuid}`
    })
    wrapper.innerHTML = buildVideoOrPlaylistEmbed(link, data.uuid)

    return wrapper
  }

  private createElement <T> (ofComponent: Type<T>) {
    const wrapper = this.document.createElement('div')

    const component = this.componentFactoryResolver.resolveComponentFactory(ofComponent)
      .create(this.injector, [], wrapper)

    return { component, wrapper }
  }

  private injectElement <T> (oldElement: Element, componentRef: ComponentRef<T>, componentWrapper: Element) {
    const hostView = componentRef.hostView as EmbeddedViewRef<any>

    this.applicationRef.attachView(hostView)

    oldElement.replaceWith(componentWrapper)
  }

  private setModel <T> (componentRef: ComponentRef<T>, attributes: Partial<T>) {
    const changes: SimpleChanges = {}

    for (const key of Object.keys(attributes)) {
      const previousValue = componentRef.instance[key]
      const newValue = attributes[key]

      componentRef.instance[key] = newValue
      changes[key] = new SimpleChange(previousValue, newValue, previousValue === undefined)
    }

    const component = componentRef.instance
    if (typeof (component as unknown as OnChanges).ngOnChanges === 'function') {
      (component as unknown as OnChanges).ngOnChanges(changes)
    }

    componentRef.changeDetectorRef.detectChanges()
  }
}
