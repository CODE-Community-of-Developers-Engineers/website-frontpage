---
title: "API Gateway Authorizers in AWS: A Fun Experiment with Key Validation"
description: "Exploring API Gateway Authorizers in AWS through a fun experiment with segmented API key validation—balancing security, efficiency, and a touch of old-school serial key logic."
slug: api-gateway-authorizers-aws-key-validation-experiment
date: 2025-03-13 00:00:00+0000
image: cover.jpg
categories:
    - AWS
    - API
tags:
    - AWS
    - API
    - Python
    - AWS API Gateway
    - Authorizers
#weight: 1       # You can add weight to some posts to override the default sorting (date descending)
---
&nbsp;
<img  style="display: block; margin-left: auto; margin-right: auto;" src="aws_api_gateway.png" alt="API-Gateway.png" width="264" height="264">
&nbsp;
# API Gateway Authorizers in AWS: A Fun Experiment with Key Validation

## **Introduction**

Lately, I’ve been shifting my API development focus towards **AWS API Gateway** and building **Python-based Lambda functions**. It’s been a fun challenge, and I’ve enjoyed learning the intricacies of AWS services.

One of the most fascinating aspects has been **API Gateway Authorizers**—a crucial security layer that ensures only authorized requests can reach my API endpoints. These authorizers often leverage **Lambda functions** to verify authentication and authorization, making them a powerful tool in security automation.

But beyond the basics, I wanted to experiment. **How can I reduce database calls while still ensuring security?** Instead of just caching validated keys (which would have been too easy), I took inspiration from **old-school serial key generators** and designed a segmented API key validation approach.

### **What Was I Trying to Solve?**

1.  **Reduce backend calls**
    
    - Prevent unnecessary queries for invalid keys
    - Mitigate brute force and denial-of-service attacks
2.  **Immediately reject expired keys**
    
    - Enforce key rotation
    - Reduce risk from long-lived keys
3.  **Ensure uniqueness of API keys**
    
    - No two keys should ever collide

Was this the best approach? **Maybe not.** Was it fun? **Absolutely.** Let’s dive into the thought process behind this experiment.

* * *

## **Understanding API Gateway Authorizers**

API Gateway Authorizers allow you to **authenticate and authorize** incoming API requests **before they reach your backend**. There are different types, but for this project, I focused on **Lambda authorizers**.

### **How They Work**

1.  **A request hits API Gateway**
2.  **API Gateway invokes the Lambda Authorizer**
3.  **Lambda validates the request**
    - Checks the API key against rules
    - Verifies expiration, format, and security measures
4.  **API Gateway decides whether to allow the request**
    - If authorized → The request continues
    - If not → The request is denied immediately

### **Beyond Basic Authorization**

In addition to **authenticating API keys**, Lambda authorizers can also **pass context** downstream to Lambda functions, allowing for:

- Role-based access control (RBAC)
- Dynamic permissions
- Fine-grained user authorization

I took this a step further by designing **a custom API key validation mechanism**.

* * *

## **My Approach: A Segmented API Key Validation**

Instead of relying solely on database lookups, I designed an **API key structure with multiple validation checkpoints**—some of which are independent of stored records.

This approach was inspired by **classic serial key generators** from the early days of software licensing. Back then, software vendors often used **pattern-based validation** rather than checking against a pre-existing database of issued keys. This allowed offline verification but also introduced **predictability**, which was eventually exploited by keygens.

I wanted to experiment with a similar concept—creating API keys with **embedded rules** to reduce unnecessary database queries while still ensuring security.

Each key follows this format:

`<Encoded Time>-<Complex Hash>-<Random Segment>-<Application Code>-<Custom Encoded Data>-<Checksum>`

Each segment plays a role in validation, though not **too strictly**—some checks are based **only on character length** rather than actual cryptographic validation. Here’s what each part does:

| Segment | Purpose | Security Concern |
| --- | --- | --- |
| **Encoded Time** | Ensures the key is within an acceptable time window to prevent expired keys from being used. | Can be guessed if keys follow a consistent timestamp pattern. |
| **Complex Hash** | Adds a layer of uniqueness. | If it lacks randomness or is easily predictable, it may be vulnerable to attacks. |
| **Random Segment + Checksum** | Helps prevent brute force attacks by requiring a valid checksum match. | If the checksum logic is simple, an attacker may reverse-engineer the pattern. |
| **Application Code** | Associates the key with a specific app or service. | If static, attackers could generate valid-looking keys. |
| **Custom Encoded Data** | Adds an extra security layer using a custom encoding method. | Custom encoding can introduce security risks if not properly implemented. |
| **Final Checksum** | Validates key integrity by ensuring all segments are consistent. | If checksum generation logic is weak, attackers could predict valid keys. |

* * *

## **Python Implementation**

Here’s how I implemented this in my **Lambda Authorizer**:

```python
import json
import boto3
import time
import hashlib
import base64
import os

# Initialize DynamoDB client
dynamodb = boto3.client('dynamodb')

def validate_epoch_time(encoded_time):
    """Decodes and validates epoch time segment."""
    try:
        decoded_bytes = base64.urlsafe_b64decode(encoded_time + '==')
        epoch_time = int.from_bytes(decoded_bytes, 'big')
        current_time = int(time.time())
        return current_time - epoch_time < 02 * 365 * 24 * 60 * 60  # 02-year limit
    except Exception:
        return False

def validate_complex_hash(segment):
    """Checks if complex hash segment matches expected format."""
    return len(segment) == 8

def validate_random_segment_with_checksum(segment):
    """Validates segment using checksum verification."""
    random_data, checksum = segment[:-2], segment[-2:]
    calculated_checksum = sum(bytearray(random_data.encode('utf-8'))) % 100
    return str(calculated_checksum).zfill(2) == checksum

def validate_application_code(segment):
    """Ensures application code has a valid format."""
    return len(segment) == 8

def custom_decode_data(encoded):
    """Custom decoding function for encoded data validation."""
    decoded = ''.join(
        chr(ord(char) - 3) if 'a' <= char <= 'z' or 'A' <= char <= 'Z' else char
        for char in encoded
    )
    return decoded

def validate_custom_encoded_data(segment):
    """Checks if custom-encoded data matches stored values."""
    decoded_data = custom_decode_data(segment)
    expected_data = os.environ.get('CRYPTO_SEED', '')[:len(segment)]
    return decoded_data == expected_data

def generate_final_checksum(*segments):
    """Generates final checksum from key segments."""
    data_for_checksum = '-'.join(segments)
    return hashlib.md5(data_for_checksum.encode()).hexdigest()[:8]

def validate_final_checksum(key, checksum_segment):
    """Validates final checksum to ensure key integrity."""
    segments = key.split('-')
    reconstructed_key_for_checksum = '-'.join(segments[1:5])
    recalculated_checksum = generate_final_checksum(*segments[1:5])
    return recalculated_checksum == checksum_segment

def validate_key(key):
    """Main function to validate the segmented API key."""
    segments = key.split('-')
    if len(segments) != 6:
        return False

    return (
        validate_epoch_time(segments[0]) and
        validate_complex_hash(segments[1]) and
        validate_random_segment_with_checksum(segments[2]) and
        validate_application_code(segments[3]) and
        validate_custom_encoded_data(segments[4]) and
        validate_final_checksum('-'.join(segments[:-1]), segments[-1])
    )

def md5_encrypt(data):
    """Encrypt data using MD5 and return the hexadecimal digest."""
    return hashlib.md5(data.encode()).hexdigest()

def lambda_handler(event, context):
    """Lambda function for API Gateway Authorizer."""
    headers = event.get("headers", {})
    api_identity = headers.get("api-identity")
    api_key = headers.get("api-key")

    if validate_key(api_key):
        response = dynamodb.get_item(
            TableName=os.environ['DYNAMODB_TABLE_NAME'],
            Key={'identity': {'S': api_identity}}
        )

        item = response.get('Item')
        if item:
            stored_api_key = item.get('attr_key', {}).get('S')
            is_active = item.get('attr_active', {}).get('BOOL', False)

            if is_active and stored_api_key == md5_encrypt(api_key):
                context_attributes = {'identity': api_identity}
                context_attributes.update({
                    k: str(v.get('BOOL') if 'BOOL' in v else v.get('S', v.get('N', '')))
                    for k, v in item.items() if k.startswith(('attr_', 'perms-')) and k != 'attr_key'
                })

                return {"isAuthorized": True, "context": context_attributes}
        return {"isAuthorized": False}
    return {"isAuthorized": False}

```

* * *

## **Was This Approach Successful?**

### ✅ **Strengths of This Approach**

✔ **Reduced backend calls** – If a key fails structural validation, there's no need to query the database.  
✔ **Prevents immediate brute force attempts** – Random segments + checksum help mitigate basic enumeration.  
✔ **Adds an additional layer before database lookup** – Reduces unnecessary load on DynamoDB.

### ❌ **Potential Weaknesses and Predictability Concerns**

❗ **Predictability in key structure** – If an attacker understands how the key segments are structured, they could attempt to **generate valid-looking keys**.  
❗ **Checksum & encoding weaknesses** – If checksum validation is simplistic or encoding is reversible, an attacker could generate keys that pass initial checks.  
❗ **Lack of true randomness** – If any segment generation follows a **deterministic** pattern (e.g., timestamps or sequential hashes), it could be exploited.

### **How It Compares to Classic Serial Key Generators**

Much like old-school **serial key systems**, this approach relies on a combination of:  
🔹 **Pattern-based validation** (instead of checking a database)  
🔹 **Checksum verification** to detect tampered keys  
🔹 **Encoded data** to hide meaning from attackers

However, classic serial key systems were ultimately **defeated** because:  
❌ They used weak hashing or checksum functions that were easy to reverse.  
❌ They relied on predictable key structures.  
❌ Attackers could analyze enough keys to recreate valid ones.

This highlights a key takeaway: **Pattern-based validation can improve efficiency but may introduce security risks if not carefully designed.**

* * *

## **Final Thoughts**

Security is always a balancing act. On one hand, **minimizing backend calls and improving efficiency** is a win. On the other, **introducing structure into key validation** could unintentionally create predictability, which is something attackers could potentially analyze and exploit.

While this segmented key approach was an interesting experiment, it raised some important questions:

- **Is this more secure than traditional key validation?** Probably not—if an attacker understands the validation logic, they could attempt to generate valid-looking keys to bypass initial checks.
- **Does it improve efficiency?** Yes—rejecting bad keys before hitting the database definitely saves on compute and response times.
- **Would I use this in production?** Maybe, but only with additional safeguards like random entropy, rate limiting, and proper logging to detect anomalous access attempts.

### **What Would I Do Differently?**

If I were to refine this approach, I’d explore:  
✅ **Adding more randomness** to make key structures harder to predict  
✅ **Incorporating a rate-limiting mechanism** to prevent brute-force attempts  
✅ **Exploring hybrid validation**—perhaps a mix of client-side verification and server-side authentication for better balance

At the end of the day, this was a **fun deep dive into API Gateway Authorizers** and how they can be used beyond their conventional purpose. Security often requires creative thinking, and sometimes, even the most **"over-engineered"** ideas teach valuable lessons about **efficiency, predictability, and risk management**.

If you’ve got thoughts, feedback, or even better ideas—I’d love to hear them. Security is always evolving, and so are the ways we approach it.