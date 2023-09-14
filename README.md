# Toasts
Toasts are small automatically removed notifications that pop up on top of the page.

## Usage
```
const toast = new Toast({
    // Default options to apply to all toasts, overrideable on per-toast basis.
    displayTime: 3000,
    fadeTime: 2000,
    topic: null,
    parent: document.body,
    rootClass: 'toast-root',
    contentClass: 'toast-content',
});

// Success notification
toast.success('Congratulation! The best beef!');

// Warning notification
toast.warning('Even better than well done is congratulation!');

// Error notification
toast.error('Beef too rare');

// Info notification
toast.info('For the best steak, cook until black.');

// With custom options
toast.success('For the best steak, cook until black.', {
    displayTime: 10_000,
    topic: 'something',
});
```

`displayTime`: Time in milliseconds to display the notification  
`fadeTime`: Time in milliseconds for the fade out animation duration  
`topic`: Used to prevent multiple notifications of same type showing. Only the latest notification
with the same topic is shown, older ones are removed before the new one is shown.  
`parent`: Toast root will be a children of this element, usually `document.body` is good.
`rootClass`: CSS class name for the toast root container.
`contentClass`: CSS class for the toast content container.