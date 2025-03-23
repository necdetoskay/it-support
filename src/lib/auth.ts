import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { headers } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function getUser() {
  try {
    // Önce cookies'e bakacağız
    const cookieStore = cookies();
    let token = cookieStore.get('token')?.value;
    
    // Cookie'de token yoksa, Authorization header'ına bakacağız
    if (!token) {
      const headersList = headers();
      const authHeader = headersList.get('Authorization');
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      console.log('Token bulunamadı: Kimlik doğrulama yok');
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return null;
  }
} 