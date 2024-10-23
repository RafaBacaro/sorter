/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.scss'
import FileUploader from './components/FileUploader'
//import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/themes/viva-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

function App() {

  return (
    <>
      <h1>Json sorter</h1>
      <p>Just start typing, upload a file or copy paste any json content. It won't accept file that are not json</p>
      <FileUploader />
    </>
  )
}

export default App
