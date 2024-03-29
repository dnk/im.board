import React from 'react'

function fix_url(url) {
    url = url.replace("https://jenkins.com.int.zone", "https://dashboard.cloud-blue.website/jenkins"); //"/jenkins");
    return url;
  }

function Status({board}) {
    if (!board) {
        return "";
    }

    return <a href={board.buildUrl} target='_blank' rel='nofollow noopener noreferrer'>
            <img src={fix_url(board.imageUrl)} />
        </a>
}

export default Status;