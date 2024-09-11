import { VideocardDto } from "./__videocard.dto"

export interface HardwareDto {

    videocard: VideocardDto
    architecture: number
    deviceMemory: string
    jsHeapSizeLimit: number

  }