import React, { useEffect } from 'react'

export const ProcessToken = () => {
    const params = new URLSearchParams(window.location.search);
    useEffect(() => {
        getToken(params.get("code"));
    })
    return (
        <></>
    )
}

async function getToken(githubToken) {
    try {
        const response = await fetch(
            ('http://localhost:8000/auth?code=' + githubToken)
        ).then(response => response.json());
        if (response.error) {
            throw Error(response);
        }
        localStorage.setItem("token", response.token);
        window.location.href = "/LandingPage";
    } catch (error) {
        console.log(error);
    }
}
