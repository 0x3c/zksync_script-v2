import { Client } from "@notionhq/client";
import { notionToken, notionWalletDBId } from '../config/index.js'

export const updateWalletStatus = async (walletAddress, liteNonce, eraNonce, balance) => {
    const notion = new Client({
        auth: notionToken,
    })
    const myPage = await notion.databases.query({
        database_id: notionWalletDBId,
        filter: {
            property: "地址",
            rich_text: {
                contains: walletAddress,
            },
        }
    });
    const page = myPage.results[0];
    if (page !== undefined) {
        const response = await notion.pages.update({
            page_id: page.id,
            properties: {
                'lite交互次数': {
                    number: liteNonce,
                },
                'era交互次数': {
                    number: eraNonce,
                },
                'lite余额': {
                    number: balance,
                }
            },
        });
    } else {
        // 创建page
        const response = await notion.pages.create({
            "parent": { "database_id": notionWalletDBId },
            "properties": {
                "地址": {
                    "title": [
                        {
                            "text": {
                                "content": walletAddress,
                            }
                        }
                    ]
                },
                "lite交互次数": {
                    number: liteNonce,
                },
                "era交互次数": {
                    number: eraNonce,
                },
                'lite余额': {
                    number: balance,
                }
            }
        })
    }
}

