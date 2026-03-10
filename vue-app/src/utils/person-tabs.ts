export const PERSON_TABS = ['account', 'articles', 'comments'] as const

export type PersonTab = (typeof PERSON_TABS)[number]

export function resolvePersonTab(input: unknown): PersonTab {
  if (typeof input !== 'string') {
    return 'account'
  }

  if (input === 'account' || input === 'articles' || input === 'comments') {
    return input
  }

  return 'account'
}
