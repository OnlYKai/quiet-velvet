const controlMedia = async(action) => {
    try {
        await fetch('http://localhost:5000/controlMedia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action }),
        });
    }
    catch (e) {
        console.error('Error sending command: ' + e);
    }
}

const favoriteSong = async (setIsFavorite) => {
    try {
        setIsFavorite(prev => !prev);
        await fetch('http://localhost:5000/favoriteSong');
    }
    catch (e) {
        console.error('Error (un)favoriting song: ' + e);
    }
}



export {
    controlMedia,
    favoriteSong,
};