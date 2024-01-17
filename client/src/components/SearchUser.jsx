// import React, { useState } from 'react';

// const SearchUser = () => {
//     const [inputValue, setInputValue] = useState('');
//     const [data, setData] = useState([]);
//     const [suggestions, setSuggestions] = useState([]);
//     const [selectedSuggestion, setSelectedSuggestion] = useState(null);

//     const onChangeFunc = async (e) => {
//         const value = e.target.value;
//         setInputValue(value);

//         try {
//             const response = await fetch(`http://localhost:3001/search?name=${value}`, {
//                 method: "GET",
//             });

//             const res = await response.json();
//             const received = res.data.result;
//             console.log(res);
//             const rec_names = res.data.names;
//             console.log(rec_names);
//             if (Array.isArray(received)) {
//                 setData(received);
//                 setSuggestions(rec_names);
//             } else {
//                 setData([]);
//                 setSuggestions([]);
//             }
//         } catch (err) {
//             console.error(err.message);
//         }
//     }

//     const onSelectSuggestion = (selectedSuggestion) => {
//         setInputValue(selectedSuggestion);
//         setSelectedSuggestion(selectedSuggestion);
//         setSuggestions([]); // Clear suggestions when a suggestion is selected
//     }

//     const onSearch = async () => {
//         // Use selectedSuggestion for the search
//         try {
//             const response = await fetch(`http://localhost:3001/search?name=${selectedSuggestion}`, {
//                 method: "GET",
//             });

//             const res = await response.json();
//             const received = res.data.result;
//             // Process the search results as needed
//         } catch (err) {
//             console.error(err.message);
//         }
//     }

//     return (
//         <div className="container">
//             <div className="search">
//                 <div>
//                     <input type="text" onChange={onChangeFunc} value={inputValue} />
//                     <button onClick={onSearch}>search</button>
//                 </div>
//                 <div className="drop-down">
//                     {
//                         suggestions.map((item, index) => (
//                             <div key={index} onClick={() => onSelectSuggestion(item)}>
//                                 {item}
//                                 <hr />
//                             </div>
//                         ))
//                     }
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default SearchUser;


import React, { useState } from 'react';
import './comp.css';

const SearchUser = () => {
    const [inputValue, setInputValue] = useState('');
    const [data, setData] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [showInfoData, setInfoData] = useState([]);
    const onChangeFunc = async (e) => {
        const value = e.target.value;
        setInputValue(value);

        try {
            const response = await fetch(`http://localhost:3001/search?name=${value}`, {
                method: "GET",
            });

            const res = await response.json();
            const received = res.data.result;
            console.log(received);
            if (Array.isArray(received)) {
                setData(received);
                setSuggestions(received.map(item => item.first_name));
            } else {
                setData([]);
                setSuggestions([]);
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    const onSelectSuggestion = (selectedSuggestion) => {
        setInputValue(selectedSuggestion);
        setSelectedSuggestion(selectedSuggestion);
        setSuggestions([]); // Clear suggestions when a suggestion is selected
    }

    const onSearch = async () => {
        try {
            const response = await fetch(`http://localhost:3001/search?name=${selectedSuggestion}`, {
                method: "GET",
            });

            const res = await response.json();
            const received = res.data.result;
            console.log("search")
            console.log(received)
            setInfoData(received)

//baki info show kora
// ekta selected search suggestion theke user info ber korbo

        } catch (err) {
            setInfoData([]);
            console.error(err.message);
        }
    }

    return (
        <div className="container">
            <div className="search">
                <div>
                    <input type="text" onChange={onChangeFunc} value={inputValue} />
                    <button onClick={onSearch}>search</button>
                </div>
                <div className="drop-down">
                    {
                        suggestions.map((item, index) => (
                            <div key={index} onClick={() => onSelectSuggestion(item)}>
                                {item}
                                <hr />
                            </div>
                        ))
                    }
                </div>
            </div>
            {selectedSuggestion && (
                <div className="user-info">
                    <h3>User Information</h3>
                    <p>Name: {selectedSuggestion.first_name} {selectedSuggestion.last_name}</p>
                    <p>Email: {selectedSuggestion.email}</p>
                </div>
            )}
        </div>
    );
}

export default SearchUser;
