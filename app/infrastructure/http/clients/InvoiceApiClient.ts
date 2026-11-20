export interface ICreateInvoiceRequest {
  invoices_type: 'individual' | 'enterprise'
  name: string
  telephone: string
  tax_number?: string
  business_address?: string
  bank?: string
  bank_account?: string
  is_def?: boolean
}

export class InvoiceApiClient {
  private $api: any

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  async createInvoice(params: ICreateInvoiceRequest, options?: any): Promise<any> {
    return this.http('/wxapp/member/invoice', {
      method: 'POST',
      body: params,
      ...options,
    } as any)
  }
}

export const invoiceApiClient = new InvoiceApiClient()
