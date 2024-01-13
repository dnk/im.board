import React from 'react'

function Status({board}) {
    if (!board) {
        return "";
    }

    return <a href={board.buildUrl} target='_blank' rel='nofollow noopener noreferrer'>
            <img src={board.imageUrl} />
        </a>
}

export default Status;