import * as fs from 'fs'

export class ExceptionUtils {

    private static classImports = {}

    private static reset() {
        this.classImports = {}
    }

    private static traverse(obj: any, currentPath: string = '') {
        for (const key in obj) {
            const className = obj[key]
            const fullPath = currentPath ? `${currentPath}/${key}` : key

            if (typeof className === 'string') {
                // Costruisci il path per l'import
                const importPath = `${basePath}${fullPath}`
                this.classImports[className] = await import(importPath)[className]
            } else if (typeof className === 'object') {
                // Scandi attraverso gli oggetti figli
                this.traverse(className, fullPath)
            }
        }
    }


    public static async generateClassImports(jsonObj: any, basePath: string): any {
        

        

        traverse(jsonObj)
        return classImports
    }

    public static loadExceptionJsonMap() {

        const jsonData = JSON.parse(fs.readFileSync('./exception_map.json', 'utf8'))
        const classImports = this.generateClassImports(jsonData, './exception_handling/')
        console.log('Class imports generated:', classImports)


    }
}
// Carica il file JSON

// Genera il mapping delle classi

