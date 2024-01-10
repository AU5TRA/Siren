import React, { useState } from 'react';

const SearchUser = () => {
    const [value, setValue] = useState('');
    const [data, setData] = useState([]);
    console.log("helllo")
    const onChangeFunc = async (e) => {
        console.log(e.target.value);
        setValue(e.target.value);
        console.log(value);
        const searchValue = e.target.value;
        try {
            const response = await fetch(`http://localhost:3001/search?name=${searchValue}`,
                {
                    method: "GET",
                });
            const res = await response.json();
            // setData(res); 
            console.log(res);
            const received = res.data.result;
            if (Array.isArray(received)) {
                setData(received);
            } else {
                setData([]); // If the fetched data is not an array, set an empty array
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    return (
        <div className="container">
            <div className="search">
                <div>
                    <input type="text" onChange={onChangeFunc} value={value} />
                    <button>search</button>
                </div>
                <div className="drop-down">
                    {
                        value && data.filter(item => item.title && item.title.startsWith && item.title.startsWith(value) && item.title !== value)
                            .slice(0, 3)
                            .map(item => (
                                <div key={item.id} onClick={() => setValue(item.title)}>
                                    {item.title}
                                    <hr />
                                </div>
                            ))
                    }
                </div>
            </div>
        </div>
    )
}

export default SearchUser;
