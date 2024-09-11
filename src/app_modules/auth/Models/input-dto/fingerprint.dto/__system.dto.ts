import { BrowserDto } from "./__browser.dto"

export interface SystemDto {

    platform: string
    cookieEnabled: boolean
    productSub: string
    product: string
    useragent: string
    browser: BrowserDto
    applePayVersion: number

  }