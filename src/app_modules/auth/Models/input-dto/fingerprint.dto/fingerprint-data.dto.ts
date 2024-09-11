import { FingerPrintModelType } from "../../enums/fingerprint-model-type.enum"
import { AudioDto } from "./__audio.dto"
import { CanvasDto } from "./__canvas.dto"
import { FontsDto } from "./__fonts.dto"
import { HardwareDto } from "./__hardware.dto"
import { LocalesDto } from "./__locales.dto"
import { MathDto } from "./__math.dto"
import { PluginsDto } from "./__plugins.dto"
import { ScreenDto } from "./__screen.dto"
import { SystemDto } from "./__system.dto"
import { WebglDto } from "./__webgl.dto"

export interface FingerprintDataDto {
  
    type: FingerPrintModelType
    audio: AudioDto
    canvas: CanvasDto
    fonts: FontsDto
    hardware: HardwareDto
    locales: LocalesDto
    permissions: Permissions
    plugins: PluginsDto
    screen: ScreenDto
    system: SystemDto
    webgl: WebglDto
    math: MathDto
    
  }