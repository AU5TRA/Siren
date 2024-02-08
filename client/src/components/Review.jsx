import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Review = () => {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState('');
  const location = useLocation();
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const trainID = searchParams.get('trainId');
    const classType = searchParams.get('classId');
    

    const fetchData = async () => {
      try {
        const trainQueryParam = encodeURIComponent(trainID); 
        const classTypeQueryParam = encodeURIComponent(classType); 
        console.log(trainQueryParam);
        console.log(classTypeQueryParam);

        const url = `http://localhost:3001/review?trainID=${trainQueryParam}&classType=${classTypeQueryParam}`;

        const response = await fetch(url);
        const rec = await response.json();
        console.log(rec.data.result);

        setReview(rec.data.result.review_content);
        setRating(rec.data.result.rating);
        console.log(rec.data.result.review_content);
        console.log(rec.data.result.rating);
      } catch (error) {
        console.error(error.message);
      }
    };

    if (trainID && classType) {
      fetchData();
    }
  }, [location.search]);

  return (
    <div>
      <h1>Review</h1>
      <p>Review Content: {review}</p>
      <p>Rating: {rating}</p>
    </div>
  );
};

export default Review;
