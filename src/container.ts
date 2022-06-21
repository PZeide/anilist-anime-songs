type WithContainerHandler = (container: Element) => void;

let target: Element | null = null;
let queue: WithContainerHandler[] = [];

function invokeQueue() {
  if (target === null) {
    console.warn("Cannot invoke queue if the target container isn't present !");
    return;
  }

  queue.forEach((handler) => handler(target));
  queue = [];
}

export function searchContainer(): void {
  VM.observe(document.body, () => {
    const found = document.querySelectorAll(".grid-section-wrap")[2];

    if (found !== undefined) {
      target = found;
      invokeQueue();
      return true;
    }
  });
}

export function resetContainerInjector(): void {
  target = null;
  queue = [];
}

export function runWithContainer(handler: WithContainerHandler): void {
  if (target !== null) {
    handler(target);
    return;
  }

  queue.push(handler);
}
