use aes::Aes256;
use anyhow::{anyhow, Result};
use base64::{engine::general_purpose, Engine as _};
use cfb_mode::cipher::{AsyncStreamCipher, KeyIvInit};
use cfb_mode::Decryptor;

type Aes256CfbDec = Decryptor<Aes256>;

pub fn decrypt(encrypted_text: &str, key: &str) -> Result<String> {
    let ciphertext = general_purpose::URL_SAFE.decode(encrypted_text)?;

    if ciphertext.len() < 16 {
        return Err(anyhow!("Ciphertext too short"));
    }

    let iv = &ciphertext[..16];
    let data = &ciphertext[16..];

    // Ensure key is 32 bytes for Aes256
    let mut key_bytes = [0u8; 32];
    let provided_key = key.as_bytes();
    let len = std::cmp::min(provided_key.len(), 32);
    key_bytes[..len].copy_from_slice(&provided_key[..len]);

    let decrypter = Aes256CfbDec::new(&key_bytes.into(), iv.into());
    let mut buffer = data.to_vec();
    decrypter.decrypt(&mut buffer);

    String::from_utf8(buffer).map_err(|e| anyhow!("Invalid UTF-8: {}", e))
}
