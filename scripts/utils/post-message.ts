interface Window {
    PostMessageUtil: typeof PostMessageUtil;
}

namespace PostMessageUtil {
    export function createPostMessageHandler<T>(
        iframe: HTMLIFrameElement,
        targetOrigin: string,
        onMessage: (data: T) => void,
    ): (data: T) => void {
        const channel = new MessageChannel();
        const port = channel.port1;

        port.onmessage = (event) => onMessage(event.data);

        iframe.onload = () => {
            iframe.contentWindow!.postMessage("ready", targetOrigin, [channel.port2]);
        };

        return (data: T) => port.postMessage(data);
    }
}

window.PostMessageUtil = PostMessageUtil;
