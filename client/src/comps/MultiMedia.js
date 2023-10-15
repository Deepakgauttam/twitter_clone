import React from 'react'
import { Card, Image } from 'react-bootstrap'
import { ReactTinyLink } from 'react-tiny-link'
import getUrls from 'get-urls'

function MM(props) {
    // Extract 'post', 'expanded', and 'className' from the props
    let { post, expanded = false, className } = props

    // Define a style object for the card component
    let style = {
        card: {
            maxHeight: !expanded ? '350' : 'fit-content', // Set the card's maximum height based on 'expanded'
            overflow: 'hidden', // Hide overflow content
        },
    }

    // Extract 'entities' and 'text' from the 'post'
    let { entities = {}, text } = post

    // Extract 'photo' and 'url' from 'entities.media' and 'entities.urls'
    let {
        media: [photo] = [], // Use the first element of 'media' array or an empty array if not present
        urls: [url], // Use the first element of 'urls' array or an empty array if not present
    } = entities

    // Check if 'photo' exists and create an Image component if it does
    if (photo) {
        photo = <Image fluid rounded={true} src={photo.media_url_https} alt="media preview" />
    }

    // If 'url' doesn't exist, attempt to extract a URL from the 'text'
    if (!url) {
        let unparsed_urls = Array.from(getUrls(text)) // Extract URLs from the text
        if (unparsed_urls.length) {
            url = {
                expanded_url: unparsed_urls[0], // Use the first URL found in the text
            }
        }
    }

    // If 'url' exists, create a ReactTinyLink component to display the URL preview
    if (url) {
        url = (
            <ReactTinyLink
                width="100%"
                cardSize={expanded ? 'large' : 'small'}
                autoPlay={expanded}
                showGraphic={true}
                maxLine={2}
                minLine={1}
                url={url.expanded_url}
            />
        )
    }

    // If 'photo' or 'url' exists, return a Card component with the content
    if (photo || url)
        return (
            <Card className={`${className} w-100 bg-transparent`} style={style.card}>
                {photo}
                <div className="mt-1">{url}</div>
            </Card>
        )
    else
        return <></> // If neither 'photo' nor 'url' exists, return an empty component
}

export default MM


