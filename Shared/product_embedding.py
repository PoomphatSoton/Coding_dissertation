import json
from urllib.request import Request, urlopen

import numpy as np


def create_product_embeddings(products, batch_size=100):
    vectors = np.empty((len(products), 768), dtype=np.float32)

    for start in range(0, len(products), batch_size):
        batch = products.iloc[start:start + batch_size]
        inputs = [
            f"title: {row.title} | text: {row.search_text}"
            for row in batch.itertuples(index=False)
        ]
        request = Request(
            "http://127.0.0.1:11434/api/embed",
            data=json.dumps({
                "model": "embeddinggemma",
                "input": inputs,
                "truncate": True,
            }).encode(),
            headers={"Content-Type": "application/json"},
        )
        response = urlopen(request, timeout=300)
        vectors[start:start + len(batch)] = json.load(response)["embeddings"]
        print(f"Embedded {start + len(batch):,}/{len(products):,}")

    return vectors
