# PSCon: Product Search Through Conversations

## Overview

PSCon, is designed to assist product search through conversations with human-like language. It supports dual markets and two languages, collected via a coached human-human data collection protocol.  Additionally, it includes a knowledge graph to support the development of knowledge graph-based CPS models. This dataset is unique as it is the first to offer a CPS dataset with human-like language for dual markets and multiple languages.

The dataset is licensed under the CC-BY-4.0 license.

## Privacy

We take data privacy very seriously. All of the data you access through this repository has been carefully prepared to prevent any privacy breaches or data leakage. You can use this data with confidence, knowing that all necessary precautions have been taken.

## Download
**1. Clone**

```
git clone https://github.com/JieZouIR/PSCon.git
cd PSCon/dataset
```

## PSCon Structure

```
PSCon
└── dataset
    ├── conversation_cn.json
    ├── croissant-conversation-cn.json
    ├── knowledgeGraph_cn.json
    ├── conversation_en.json
    ├── croissant-conversation-en.json
    └── knowledgeGraph_en.json
```

- The `PSCon` is the root directory. Within this, the `dataset` directory contains various JSON files that are part of the `PSCon` dataset. 
- `dataset`
  - `conversation_cn.json`, `conversation_en.json` are the Chinese and English conversation data, respectively.
  - `croissant-conversation-cn.json`, `croissant-conversation-en.json` are the Croissant Format.
  - `knowledgeGraph_cn.json`, `knowledgeGraph_en.json` are the Chinese and English knowledge graph data, respectively. The knowledge graph consists of users, products, and their details.


## Dataset Description

The conversation information in the PSCon dataset is stored in individual conversation_xx.json files. Each file contains a list of Python arrays, and each item in the array is a Python dictionary that represents a complete conversation. With each key indicating:

- `conv_id`: A number representing the corresponding conversation ID.
- `conversation`: Detailed conversation content.
  - `msg_id`: A unique identifier for each message in the conversation.
  - `turn_id`: The turn of the conversation.
  - `role`: The role of the messenger: user/system.
  - `content`: The specific content of the message.
  - `intent`: The intent of the user to send a message.
  - `action`: The action of the system to send a message.
  - `keywords`: The keywords in user messages.
  - `clarifying_attribute`: The attributes of system clarification action that takes effect when the action of the system is `clarify`.
  - `search\_results`: search results of products returned by the search engine.
  - `recommended_products`: The products recommended by the system that takes effect when the action of the system is `recommend`.
  - `user_rating`: Whether the user likes the products recommended by the system that takes effect when the system recommends the product and the `turn_id` of the message is the last turn.

To be specific, here is an example instance from conversation_en.json (Croissant file is croissant-conversation-en.json):

```json

{
    "conv_id": 19360,
    "conversation": [
      {
        "msg_id": 19377,
        "turn_id": 1,
        "role": "user",
        "content": "Hi, I am looking for a mobile phone. ",
        "intent": "Reveal",
        "keywords": [
          "mobile phone"
        ]
      },
      {
        "msg_id": 19398,
        "turn_id": 1,
        "role": "system",
        "content": "Sure. What brand do you prefer? ",
        "action": "Clarify",
        "clarifying_attribute": [
          "Brand"
        ]
      },
      {
        "msg_id": 19412,
        "turn_id": 2,
        "role": "user",
        "content": "I am a fun of Samsung. ",
        "intent": "Interpret",
        "keywords": [
          "mobile phone",
          "Samsung"
        ]
      },
      {
        "msg_id": 19423,
        "turn_id": 2,
        "role": "system",
        "content": "OK. Do you have any requirements on phone color? ",
        "action": "Clarify",
        "clarifying_attribute": [
          "Phone Color"
        ]
      },
      {
        "msg_id": 19435,
        "turn_id": 3,
        "role": "user",
        "content": "Black phone color, please. ",
        "intent": "Interpret",
        "keywords": [
          "mobile phone",
          "Samsung",
          "Black phone color"
        ]
      },
      {
        "msg_id": 19452,
        "turn_id": 3,
        "role": "system",
        "content": "Sure, what about the following options? ",
        "action": "Recommend",
        "search_results": [
          {
            "product_id": "B08VLMQ3KS"
          },
          {
            "product_id": "B087XBPYWB"
          },
          {
            "product_id": "B08NC5G33F"
          },
          {
            "product_id": "B083TJK6WN"
          },
          {
            "product_id": "B0BLP57HTN"
          },
          {
            "product_id": "B0BTZ825B3"
          },
          {
            "product_id": "B0C1ZZRZH6"
          },
          {
            "product_id": "B09V2CVC9V"
          },
          {
            "product_id": "B0CDMTBBW2"
          },
          {
            "product_id": "B0C544TBQM"
          },
          {
            "product_id": "B07RT1ZY3N"
          },
          {
            "product_id": "B09598JR5G"
          },
          {
            "product_id": "B01CJ3SCCI"
          },
          {
            "product_id": "B09RX3CJ6F"
          },
          {
            "product_id": "B09R6FJWWS"
          },
          {
            "product_id": "B09P484865"
          },
          {
            "product_id": "B07RL93F7T"
          }
        ],
        "recommended_products": [
          {
            "product_id": "B08VLMQ3KS",
            "product_title": "Samsung Galaxy S21 5G, US Version, 128GB, Phantom Gray - Unlocked (Renewed)"
          },
          {
            "product_id": "B0C544TBQM",
            "product_title": "SAMSUNG Galaxy S23 Ultra 5G Factory Unlocked 256GB - Phantom Black (Renewed)"
          },
          {
            "product_id": "B09RX3CJ6F",
            "product_title": "Samsung Galaxy S10 G973U Unlocked 128GB - Prism Black (Renewed)"
          }
        ]
      },
      {
        "msg_id": 19469,
        "turn_id": 4,
        "role": "user",
        "content": "I like the second one, but with 512 GB memory storage",
        "intent": "Interpret",
        "keywords": [
          "mobile phone",
          "Samsung",
          "Black phone color",
          "512 GB memory storage"
        ]
      },
      {
        "msg_id": 19490,
        "turn_id": 4,
        "role": "system",
        "content": "OK. Here is the one with 512 GB memory storage.",
        "action": "Recommend",
        "search_results": [
          {
            "product_id": "B087XBPYWB"
          },
          {
            "product_id": "B08NC5G33F"
          },
          {
            "product_id": "B0BLP57HTN"
          },
          {
            "product_id": "B0BTZ825B3"
          },
          {
            "product_id": "B09598JR5G"
          },
          {
            "product_id": "B0C1ZZRZH6"
          },
          {
            "product_id": "B09P484865"
          },
          {
            "product_id": "B0C78D8V6Y"
          },
          {
            "product_id": "B08B8JSG95"
          },
          {
            "product_id": "B0BYTBFFGS"
          },
          {
            "product_id": "B09RX3CJ6F"
          },
          {
            "product_id": "B09HY6N45T"
          },
          {
            "product_id": "B0CDMTBBW2"
          },
          {
            "product_id": "B07RL93F7T"
          },
          {
            "product_id": "B01CJ3SCCI"
          },
          {
            "product_id": "B09V2CVC9V"
          }
        ],
        "recommended_products": [
          {
            "product_id": "B0BLP57HTN",
            "product_title": "SAMSUNG Galaxy S23 Ultra Cell Phone, Factory Unlocked Android Smartphone, 512GB, 200MP Camera, Night Mode, Long Battery Life, S Pen, US Version, 2023 Phantom Black"
          }
        ]
      },
      {
        "msg_id": 19510,
        "turn_id": 5,
        "role": "user",
        "content": "Great. I like it. Thanks. ",
        "intent": "Interpret",
        "user_rating": [
          {
            "product_id": "B08VLMQ3KS",
            "product_rate": "Samsung Galaxy S21 5G, US Version, 128GB, Phantom Gray - Unlocked (Renewed)(disliked)"
          },
          {
            "product_id": "B0BLP57HTN",
            "product_rate": "SAMSUNG Galaxy S23 Ultra Cell Phone, Factory Unlocked Android Smartphone, 512GB, 200MP Camera, Night Mode, Long Battery Life, S Pen, US Version, 2023 Phantom Black(liked)"
          },
          {
            "product_id": "B0C544TBQM",
            "product_rate": "SAMSUNG Galaxy S23 Ultra 5G Factory Unlocked 256GB - Phantom Black (Renewed)(disliked)"
          },
          {
            "product_id": "B09RX3CJ6F",
            "product_rate": "Samsung Galaxy S10 G973U Unlocked 128GB - Prism Black (Renewed)(disliked)"
          }
        ]
      }
    ]
  }
```

