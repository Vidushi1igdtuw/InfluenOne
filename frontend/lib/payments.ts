export const SERVICE_PRICES = {
  dashboard_access: true,
  linkedin_post: true,
  linkedin_post_with_image: true,
  ai_generate_post: true,
  ai_generate_post_with_image: true,
  schedule_post: true,
  url_to_post: true,
  post_ideas: true,
  templates: true,
} as const

export type ServiceKey = keyof typeof SERVICE_PRICES

export const WEB_PACK_USES = 10

export interface PaymentConfig {
  stripe_amount_usd: string
  stripe_ready: boolean
  pack_uses: number
  website_stripe_only: boolean
  fet_amount: string
  fet_address: string
  fet_network: string
  fet_denom: string
}

export function getServicePrice(_service: ServiceKey): number {
  return 1
}
