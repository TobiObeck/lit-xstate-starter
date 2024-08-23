import { html, render } from './!/lit.js'
import { store } from './example_store.js'
import {
  createMachine,
  createActor,
  setup,
  assign,
  raise,
  enqueueActions,
} from './!/xstate.js'

const rootEl = document.getElementById('root')
if (!rootEl) throw '#root element not found!'

// Define a template
/** type */
const myTemplate = (name) => html`<p>Hello ${name}</p>`

// Render the template to the document
// render(myTemplate('World'), rootEl)

const NavigationComp = () =>
  html`<button @click="${() => actor.send({ type: 'to_home' })}">
      Go to Home
    </button>
    <button @click="${() => actor.send({ type: 'to_about' })}">
      Go to About
    </button>
    <button @click="${() => actor.send({ type: 'to_contact' })}">
      Go to Contact
    </button>`

// only rerenders state when switching page lol
const CountButtons = () => html`
  <button @click="${() => store.send({ type: 'add', num: -1 })}">-1</button>
  <span style="padding: 0.5rem">${store.getSnapshot().context.count}</span>
  <button @click="${() => store.send({ type: 'inc' })}">+1</button>
`

// Define page rendering functions using lit-html
const renderHome = (context, event) => html`
  <h1>Home Page</h1>
  <p>Welcome to the home page!</p>
  ${NavigationComp()}

  <div style="margin-top: 1rem">${CountButtons()}</div>
`

const renderAbout = () => html`
  <h1>About Page</h1>
  <p>Learn more about us.</p>
  ${NavigationComp()}
`

const renderContact = () => html`
  <h1>Contact Page</h1>
  <p>Get in touch with us.</p>
  ${NavigationComp()}
`

// Create the machine with state-dependent actions to render the appropriate content
const routerMachine = createMachine(
  {
    id: 'router',
    initial: 'initial',
    context: {
      page: '/',
    },
    on: {
      to_home: {
        actions: [assign({ page: '/' }), 'renderHome', 'renderUrlPath'],
      },
      to_about: {
        actions: [assign({ page: '/about' }), 'renderAbout', 'renderUrlPath'],
      },
      to_contact: {
        actions: [
          assign({ page: '/contact' }),
          'renderContact',
          'renderUrlPath',
        ],
      },
    },
    states: {
      initial: {
        entry: ['renderHome', 'syncStateFromUrl'],
      },
    },
  },
  {
    actions: {
      renderHome: () => render(renderHome(), rootEl),
      renderAbout: () => render(renderAbout(), rootEl),
      renderContact: () => render(renderContact(), rootEl),
      renderUrlPath: ({ context, event }) =>
        history.pushState({ ...context }, '', `#${context.page}`),
      syncStateFromUrl: enqueueActions(({ context, enqueue }) => {
        //
        const pathName = window.location.href.replace(
          window.location.origin + '/#/',
          ''
        )
        console.log(pathName)

        enqueue.assign({
          page: '/' + pathName,
        })

        enqueue.raise({ type: `to_${pathName}` })
      }),
    },
  }
)

const actor = createActor(routerMachine)
actor.subscribe((snapshot) => {
  console.log(snapshot.value, snapshot.context)
})
actor.start()

// console.log(actor.getSnapshot())
