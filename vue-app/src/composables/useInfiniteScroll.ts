import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

interface UseInfiniteScrollOptions {
  enabled?: Ref<boolean>
  rootMargin?: string
}

export function useInfiniteScroll(
  target: Ref<HTMLElement | null>,
  onIntersect: () => void,
  options: UseInfiniteScrollOptions = {},
) {
  const observer = ref<IntersectionObserver | null>(null)

  function disconnect() {
    observer.value?.disconnect()
    observer.value = null
  }

  function observe() {
    if (!target.value) {
      return
    }

    observer.value = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersect()
        }
      },
      {
        rootMargin: options.rootMargin ?? '120px',
      },
    )

    observer.value.observe(target.value)
  }

  watch(
    () => options.enabled?.value,
    (enabled) => {
      if (enabled === false) {
        disconnect()
        return
      }

      disconnect()
      observe()
    },
    { immediate: true },
  )

  watch(target, () => {
    disconnect()
    observe()
  })

  onBeforeUnmount(disconnect)

  return {
    observe,
    disconnect,
  }
}
