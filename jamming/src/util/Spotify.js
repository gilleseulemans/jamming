

const clientID = 'REMOVED FOR SAFETY';
const redirectUri='http://localhost:3000';
let accesToken;
const Spotify = {
    getAccesToken(){
        if(accesToken){
            return accesToken;
        }
        //check for accesToken match
        //window.location.href gives url for the page you are on
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if(accessTokenMatch && expiresInMatch){
            accesToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            //grab new Accesstoken when it expires
            window.setTimeout(() => accesToken='' , expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            
            return accesToken;
        }else{
            const accesUrl = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accesUrl;
        }
    },
    
    search(term) {
        const accessToken = Spotify.getAccesToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,
        { headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then(response => {
        return response.json();
    }).then(jsonResponse => {
        if(!jsonResponse.tracks){
            return [];
        }
        return jsonResponse.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri

        }))
    })
    },

    savePlaylist(name, trackUris) {
        if(!name || !trackUris.length){
            return;

        }

        const accesToken = Spotify.getAccesToken();
        const headers= { Authorization: `Bearer ${accesToken}`}
        let userId;

        return fetch('https://api.spotify.com/v1/me', {headers: headers}
        ).then(response => response.json()
        ).then(jsonResponse => {
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, 
            {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({name: name})
            }).then(response => response.json()
            ).then(jsonRespone => {
                const playlistId = jsonRespone.id
                return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris: trackUris})
                })
            })
        })

    }
};


export default Spotify;
