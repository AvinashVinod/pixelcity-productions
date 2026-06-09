// hooks/useHomepageData.js
import { useState, useEffect } from 'react';
import { client } from '../utils/client';

export const useHomepageData = () => {
    const [data, setData] = useState({
        whyUs: null,
        about: null,
        collection: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        const query = `{
            "homepage": *[_type == "homepage"][0] {
                _id,
                whyUsDescription,
                aboutDescription,
                "aboutImageUrl": aboutImage.asset->url,
                "aboutImageAlt": aboutImage.alt
            },
            "collection": *[_type == "homepageCollection"][0] {
                "collectionItems": [
                    {
                        "heading": firstImage.heading,
                        "imageUrl": firstImage.image.asset->url,
                        "alt": firstImage.image.alt,
                        "order": 1
                    },
                    {
                        "heading": secondImage.heading,
                        "imageUrl": secondImage.image.asset->url,
                        "alt": secondImage.image.alt,
                        "order": 2
                    },
                    {
                        "heading": thirdImage.heading,
                        "imageUrl": thirdImage.image.asset->url,
                        "alt": thirdImage.image.alt,
                        "order": 3
                    },
                    {
                        "heading": fourthImage.heading,
                        "imageUrl": fourthImage.image.asset->url,
                        "alt": fourthImage.image.alt,
                        "order": 4
                    }
                ]
            }
        }`;
        
        client.fetch(query)
            .then((result) => {
                setData({
                    whyUs: result.homepage,
                    about: result.homepage,
                    collection: result.collection?.collectionItems || [],
                    loading: false,
                    error: null
                });
            })
            .catch((err) => {
                console.error("Error fetching homepage data:", err);
                setData({
                    ...data,
                    loading: false,
                    error: err
                });
            });
    }, []);

    return data;
};