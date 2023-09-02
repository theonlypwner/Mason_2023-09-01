# Mason_2023-09-01

This is a keygen solution for Mason's keygenme challenge released on 2023-09-01.

## Problem Statement

Mason's challenge roughly does this:

```cpp
// #include a bunch of stuff

string base64ToString(string); // just calls cppcodec and inefficiently copies byte-by-byte lol

string doChallenge(string raw) { // just uses TweetNaCl
    size_t nonceLen = 10;

    static const char nonce_bytes[24] = { /* ... */ };
    static const char hackerSk_bytes[32] = { /* ... */ };
    static const char mePk_bytes[32] = { /* ... */ };

    string nonceStr(nonce_bytes, 24);
    string skStr(hackerSk_bytes, 32);
    string pkStr(mePk_bytes, 32);
    
    string message = crypto_box_curve25519xsalsa20poly1305_tweet_open(
        raw.substr(nonceLen),
        raw.substr(0, nonceLen) + nonceStr.substr(nonceLen),
        pkStr,
        skStr);
    return message;
}

int main () {
    string key;
    cout << "Welcome to the keygen challenge! Will you be able to get in? Is VZ the master hacker?" << endl;
    cout << "Please enter your key: ";

    cin >> key;

    cout << "You entered \"" << key << "\"" << endl;

    try {
        string raw = base64ToString(key);
        string message = doChallenge(raw);
        cout << message << endl;
    } catch (...) {
        cout << "Lulz! Nice try..." << endl;
    }
}
```

He supplied a bunch of example keys that output `VZ is a great hacker`.

## Solution

At first glance, it looks like there is no hope to make a keygen, as it uses asymmetric encryption with authentication.

We have our secret key, our public key (which we can trivially compute from our secret key), and Mason's public key.
There is no easy way to compute his secret key.

But it turns out that `crypto_box_curve25519xsalsa20poly1305_tweet_open` actually does symmetric encryption.
The algorithm uses one public key and one secret key to create a shared secret, which is used for both
encrypting and decrypting. So we don't care about Mason's secret key at all. In fact, simply calling
`crypto_box_curve25519xsalsa20poly1305_tweet` with the decryption keys will give us an output that can be decrypted and authenticated.
For fun, I decided to compute the shared secret and hardcode that instead.

The first 10 bytes of the key are used to store the first 10 bytes of the nonce, and the remaining 14 bytes are hardcoded.
The program contains 24 bytes in `nonce_bytes`, but the first 10 are unused. The remaining bytes are used to output a message.

For any given output message, there are therefore 2^80 possible keys (10 prefix bytes = 80 prefix bits).
We can choose 13 prefix base64 characters (78 bits) and compute the four keys with this prefix.
To simulate standard keygen functionality, we also simply add a "Generate" button to randomize the prefix bits.
