// @ts-nocheck
import { createStore } from './!/xstore.js'

export const store = createStore(
  // Initial context
  { count: 0, name: 'David' },
  // Transitions
  {
    inc: {
      count: (context) => context.count + 1,
    },
    add: {
      count: (context, event) => context.count + event.num,
    },
    changeName: {
      name: (context, event) => event.newName,
    },
  }
)

// Get the current state (snapshot)
console.log(store.getSnapshot())
// => {
//   status: 'active',
//   context: { count: 0, name: 'David' }
// }

// Subscribe to snapshot changes
store.subscribe((snapshot) => {
  console.log(snapshot.context)
})

// // Send an event
// store.send({ type: 'inc' })
// // logs { count: 1, name: 'David' }

// store.send({ type: 'add', num: 10 })
// // logs { count: 11, name: 'David' }

// store.send({ type: 'changeName', newName: 'Jenny' })
// // logs { count: 11, name: 'Jenny' }
