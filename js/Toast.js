export default class Toast
{
    #nextToastId = 0;
    #toasts = {};
    #options;
    #observer;

    constructor(options = {})
    {
        this.#options = Object.assign({}, options, {
            displayTime: 3000,
            fadeTime: 2000,
            topic: null,
            parent: document.body,
            rootClass: 'toast-root',
            contentClass: 'toast-content',
        });

        this.#observer = new MutationObserver((list, observer) => {
            if (this.#visibleCount() === 0) {
                observer.disconnect();
                return;
            }

            for (const mutation of list) {
                if (mutation.type === 'childList' && mutation.removedNodes.length !== 0) {
                    for (const removed of mutation.removedNodes) {
                        if (removed.nodeName === 'DIALOG' && removed.lastChild.classList.contains(this.#options.rootClass)) {
                            // If we closed a dialog, move toast root to body
                            document.body.append(removed.lastChild);
                        }
                    }
                } else if (mutation.type === 'childList' && mutation.addedNodes.length !== 0) {
                    for (const added of mutation.addedNodes) {
                        if (added.nodeName === 'DIALOG' && added.hasAttribute('open')) {
                            // If we opened a new dialog, move toast root to the dialog
                            added.append(document.querySelector('.' + this.#options.rootClass));
                        }
                    }
                }
            }
        });
    }

    success(message, title = null, options = {})
    {
        this.#show('success', message, title, options);
    }

    info(message, title = null, options = {})
    {
        this.#show('info', message, title, options);
    }

    warning(message, title = null, options = {})
    {
        this.#show('warning', message, title, options);
    }

    error(message, title = null, options = {})
    {
        this.#show('error', message, title, options);
    }

    #show(type, message, title, options = {})
    {
        options = Object.assign({}, this.#options, options, {
            parent: document.querySelector('dialog[open]') ?? document.body
        });

        let toastId = this.#nextToastId++;
        let toast = document.createElement('div');
        toast.classList.add('toast', type);

        let toastRoot = options.parent.querySelector('.' + this.#options.rootClass);
        if (toastRoot === null) {
            toastRoot = document.createElement('div');
            toastRoot.classList.add(this.#options.rootClass);
            options.parent.append(toastRoot);
            this.#observer.observe(document.body, { attributes: true, childList: true });
        }

        let toastContent = document.createElement('div');
        toastContent.classList.add(this.#options.contentClass);
        toast.append(toastContent);

        if (title !== '' && title !== null) {
            let toastTitle = document.createElement('h3');
            toastTitle.textContent = title;
            toastContent.append(toastTitle);
        }

        if (message instanceof HTMLElement) {
            if ('content' in message) {
                toastContent.append(message.content);
            } else {
                toastContent.append(message);
            }
        } else {
            let toastMessage = document.createElement('p');
            toastMessage.textContent = message;
            toastContent.append(toastMessage);
        }

        this.#toasts[toastId] = {
            'id': toastId,
            'options': options,
            'elm': toast,
            'root': toastRoot,
            'message': message,
            'title': title
        };

        if (options.topic !== null) {
            let oldToast = this.#byTopic(options.topic, toastId);
            if (oldToast) {
                this.#remove(oldToast.id);
            }
        }

        toastRoot.append(toast);

        toast.addEventListener('click', (e) => {
            if (!e.isTrusted) {
                return;
            }
            this.#remove(toastId);
        });

        if (options.displayTime !== 0) {
            this.#startTimeouts(toastId, options);

            toast.addEventListener('mouseover', () => {
                clearTimeout(this.#toasts[toastId].fadeTimeout);
                clearTimeout(this.#toasts[toastId].removeTimeout);
                this.#stopFade(this.#toasts[toastId]);
            });

            toast.addEventListener('mouseout', () => {
                if (!this.#toasts[toastId]) {
                    return;
                }
                this.#startTimeouts(toastId, options);
            });
        }
    }

    #startTimeouts(toastId, options)
    {
        this.#toasts[toastId].fadeTimeout = setTimeout(() => {
            this.#startFade(this.#toasts[toastId])
        }, options.displayTime);
            this.#toasts[toastId].removeTimeout = setTimeout(() => {
            this.#remove(toastId)
        }, options.displayTime + options.fadeTime);
    }

    #startFade(toast)
    {
        toast.elm.style.cssText = 'opacity: 0; transition-duration: ' + this.#options.fadeTime / 1000 + 's';
    }

    #stopFade(toast)
    {
        toast.elm.style.cssText = '';
    }

    #remove(toastId)
    {
        if (this.#toasts[toastId].removeTimeout) {
            clearTimeout(this.#toasts[toastId].removeTimeout);
        }

        if (this.#toasts[toastId].fadeTimeout) {
            clearTimeout(this.#toasts[toastId].fadeTimeout);
        }

        this.#toasts[toastId].elm.remove();
        delete this.#toasts[toastId];

        let toastRoot = this.#options.parent.querySelector('.' + this.#options.rootClass);
        if (toastRoot && this.#visibleCount() === 0) {
            toastRoot.remove();
            this.#nextToastId = 0;
        }
    }

    #byTopic(topic, ignoreId = null)
    {
        for (const toast of Object.values(this.#toasts)) {
            if (toast.options.topic === topic && (toast.id !== ignoreId || ignoreId === null) ) {
                return toast;
            }
        }

        return false;
    }

    #visibleCount()
    {
        return Object.keys(this.#toasts).length;
    }
}

Object.freeze(Toast.prototype);