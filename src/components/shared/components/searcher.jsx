import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import Swal from 'sweetalert2';

export const Searcher = ({onSearchResult, type}) => {   
    
    const [odsData, setOdsData] = useState([]);
    const [selectedOds, setSelectedOds] = useState("");
    const [testToSearch, setTestToSearch] = useState("");

    useEffect(() => {
        loadOds();
    }, []);

    // Obtener ODS para cargar el select
    const loadOds = async () => {    
        const response = await axios.get(process.env.REACT_APP_NODE_API + 'ods');
        setOdsData(response.data.ods);
    }

    const handleSearch = async () => {
        if(selectedOds.trim() === "" && testToSearch.trim() === ""){
            Swal.fire({
                title: "No se encontró ningún parámetro de búsqueda",
                confirmButtonColor: "#00796B",
            });
            return;
        }
        console.log('selectedOds: ', selectedOds);
        console.log('testToSearch: ', testToSearch);   
        const params = {
            type: type || 1,
            ods: selectedOds,
            keyWords: testToSearch
        };     
        const response = await axios.get(`${process.env.REACT_APP_NODE_API}posts/search`, {
            params: params,
            validateStatus: (status) => {
                return status <= 500;
            }
        });
        if (response.status >= 400 && response.status <= 500) {
            Swal.fire({
                title: response.data.message || "No se encontró resultados",
                confirmButtonColor: "#00796B",
            });
            return;
        }
        const data = response.data; 
        //Devolver resultado de la búsqueda
        onSearchResult(data);
    }
    

    return (
        <div className='mb-2 w-[50rem]'>
            <div className="flex rounded-lg border bg-gray-50 text-gray-800 outline-none"> 
                <input
                    type="search"
                    placeholder="Buscar..."
                    className="w-full ml-1 bg-gray-50 px-3 py-2 outline-none ring-primary ring-opacity-50 transition duration-100 focus:ring"
                    value={testToSearch}
                    onChange={(e) => setTestToSearch(e.target.value)}
                />
                <select 
                    placeholder='- Seleccione -' 
                    className="border-r rounded-l-lg border-l bg-gray-50 px-3 py-2 outline-none ring-primary ring-opacity-50 transition duration-100 focus:ring"                    
                    value={selectedOds}
                    onChange={(e) => setSelectedOds(e.target.value)}
                >                    
                    <option value="">
                        -- Seleccionar ODS --
                    </option>
                    {odsData.map((ods) => (
                        <option 
                            key={ods.id} 
                            value={ods.id} 
                            className='p-2'
                        >
                            {"ODS " + ods.number + " - " + ods.toShow}
                        </option>
                    ))}
                </select>
                <div className='border-l flex items-center my-auto px-2 focus:ring'>
                    <Tooltip title="Buscar" placement="top">
                        <SearchIcon 
                            className='text-primary hover:text-opacity-70 cursor-pointer focus:ring' 
                            onClick={handleSearch}
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

export default Searcher;
