use aes::Aes256;
use aes::cipher::NewCipher;
use aes::cipher::AsyncStreamCipher;
use anyhow::{anyhow, Result};
use base64::{engine::general_purpose, Engine as _};
use cfb_mode::Cfb;

type Aes256Cfb = Cfb<Aes256>;

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

    let mut iv_bytes = [0u8; 16];
    iv_bytes.copy_from_slice(iv);

    // Create cipher and decrypt
    let mut cipher = Aes256Cfb::new_from_slices(&key_bytes, &iv_bytes)
        .map_err(|e| anyhow!("Cipher init error: {:?}", e))?;
    
    let mut buffer = data.to_vec();
    cipher.decrypt(&mut buffer);

    String::from_utf8(buffer).map_err(|e| anyhow!("Invalid UTF-8: {}", e))
}
