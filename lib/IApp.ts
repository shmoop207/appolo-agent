export interface IApp {
    render(path: string | string[], params?: any): Promise<string>
}