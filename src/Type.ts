
export interface AppDataType {
    Radios?: string;
    open?: boolean;
    rcrl?: boolean;
    times?: string[];
    city?: { id: string, name: string };
    Autostart?: boolean;
    language: string
    StartShow:boolean
    Skipversion:string
}
export interface TimesProps {
    disabled?: boolean;
  }
declare const App: React.FC;
export default App;