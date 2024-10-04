/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css'
import FileUploader from './components/FileUploader'
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

function App() {

  return (
    <>
      <h1>Json sorter</h1>
      <FileUploader />
    </>
  )
}

export default App
