const pwnage = Uint8Array.from([
  244, 225, 206, 111,  42,  36,  80,  27,
   61,   3, 177,  46,  43,  28,  24,  63,
  149, 157, 104, 158, 159, 123, 148,  86,
  151,  28, 185, 211, 246, 139,  50, 254
])

function refresh () {
  const prefixBytes = nacl.util.decodeBase64(
    document.getElementById('desiredPrefix').value.replace(/[^a-zA-Z0-9/+]+/g, '').slice(0, 13).padEnd(13, 'A') + 'A=='
  )
  const prefixLastByte = prefixBytes[9]

  const plaintext = document.getElementById('desiredOutput').value

  const results = []
  for (let i = 0; i < 4; i++) {
    prefixBytes[9] = prefixLastByte | i

    const nonce = Uint8Array.from([
      0x69, 0x69, 0x6e, 0xe9, 0x55, 0xb6, 0x2b, 0x73, 0xcd, 0x62, // will be overwritten
      0xbd, 0xa8, 0x75, 0xfc, 0x73, 0xd6, 0x82, 0x19, 0xe0, 0x03, 0x6b, 0x7a, 0x0b, 0x37
    ])

    nonce.set(prefixBytes)

    const boxed = nacl.box.after(nacl.util.decodeUTF8(plaintext), nonce, pwnage)

    const fullMessage = new Uint8Array(prefixBytes.length + boxed.length)
    fullMessage.set(prefixBytes)
    fullMessage.set(boxed, prefixBytes.length)

    results.push(nacl.util.encodeBase64(fullMessage))
  }

  document.getElementById('output').innerText = results.join('\n')
}

randomizePrefix.addEventListener('click', () => {
  document.getElementById('desiredPrefix').value = nacl.util.encodeBase64(self.crypto.getRandomValues(new Uint8Array(10))).slice(0, 13)
  refresh()
})
for (const e of document.getElementsByClassName('refreshOnChange')) {
  e.addEventListener('change', refresh)
  e.addEventListener('keyup', refresh)
}
document.addEventListener('DOMContentLoaded', refresh)
