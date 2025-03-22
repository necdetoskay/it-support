import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Rol oluşturma ve güncelleme için validasyon şeması
const rolSchema = z.object({
  name: z.string().min(3, "Rol adı en az 3 karakter olmalıdır").max(50, "Rol adı en fazla 50 karakter olabilir"),
  permissions: z.array(z.string())
});

// GET - Tüm rolleri listele
export async function GET(request: Request) {
  try {
    // Sistemde tanımlı roller
    const defaultRoles = [
      {
        id: "admin",
        name: "Yönetici",
        permissions: [
          { id: "talep_olusturma", name: "Talep Oluşturma", description: "Yeni talep oluşturabilir", checked: true },
          { id: "talep_guncelleme", name: "Talep Güncelleme", description: "Mevcut talepleri güncelleyebilir", checked: true },
          { id: "talep_silme", name: "Talep Silme", description: "Talepleri silebilir", checked: true },
          { id: "talep_atama", name: "Talep Atama", description: "Talepleri kullanıcılara atayabilir", checked: true },
          { id: "rapor_goruntuleme", name: "Rapor Görüntüleme", description: "Raporları görüntüleyebilir", checked: true },
          { id: "ayarlar_yonetimi", name: "Ayarlar Yönetimi", description: "Sistem ayarlarını değiştirebilir", checked: true },
          { id: "kullanici_yonetimi", name: "Kullanıcı Yönetimi", description: "Kullanıcıları yönetebilir", checked: true },
        ]
      },
      {
        id: "destek",
        name: "Destek Personeli",
        permissions: [
          { id: "talep_olusturma", name: "Talep Oluşturma", description: "Yeni talep oluşturabilir", checked: true },
          { id: "talep_guncelleme", name: "Talep Güncelleme", description: "Mevcut talepleri güncelleyebilir", checked: true },
          { id: "talep_silme", name: "Talep Silme", description: "Talepleri silebilir", checked: false },
          { id: "talep_atama", name: "Talep Atama", description: "Talepleri kullanıcılara atayabilir", checked: true },
          { id: "rapor_goruntuleme", name: "Rapor Görüntüleme", description: "Raporları görüntüleyebilir", checked: true },
          { id: "ayarlar_yonetimi", name: "Ayarlar Yönetimi", description: "Sistem ayarlarını değiştirebilir", checked: false },
          { id: "kullanici_yonetimi", name: "Kullanıcı Yönetimi", description: "Kullanıcıları yönetebilir", checked: false },
        ]
      },
      {
        id: "kullanici",
        name: "Kullanıcı",
        permissions: [
          { id: "talep_olusturma", name: "Talep Oluşturma", description: "Yeni talep oluşturabilir", checked: true },
          { id: "talep_guncelleme", name: "Talep Güncelleme", description: "Mevcut talepleri güncelleyebilir", checked: false },
          { id: "talep_silme", name: "Talep Silme", description: "Talepleri silebilir", checked: false },
          { id: "talep_atama", name: "Talep Atama", description: "Talepleri kullanıcılara atayabilir", checked: false },
          { id: "rapor_goruntuleme", name: "Rapor Görüntüleme", description: "Raporları görüntüleyebilir", checked: false },
          { id: "ayarlar_yonetimi", name: "Ayarlar Yönetimi", description: "Sistem ayarlarını değiştirebilir", checked: false },
          { id: "kullanici_yonetimi", name: "Kullanıcı Yönetimi", description: "Kullanıcıları yönetebilir", checked: false },
        ]
      }
    ];

    // Gerçek bir veritabanı bağlantısı olsaydı burada rolleri veritabanından çekerdik
    return NextResponse.json(defaultRoles);
  } catch (error) {
    console.error("Roller getirilirken hata:", error);
    return NextResponse.json(
      { error: "Roller getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST - Yeni rol oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, permissions } = rolSchema.parse(body);

    // Gerçek bir veritabanı bağlantısı olsaydı burada rol oluştururduk
    // Şimdilik başarılı olduğunu varsayalım
    return NextResponse.json({
      id: "new-role-" + Date.now(),
      name,
      permissions: permissions.map(p => ({ id: p, checked: true }))
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Rol oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Rol oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 