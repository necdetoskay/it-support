import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Rol güncelleme için validasyon şeması
const rolSchema = z.object({
  name: z.string().min(3, "Rol adı en az 3 karakter olmalıdır").max(50, "Rol adı en fazla 50 karakter olabilir"),
  permissions: z.array(z.string())
});

// Sistemde tanımlı rolleri simüle eden fonksiyon
const getRoleById = (id: string) => {
  const defaultRoles = [
    {
      id: "admin",
      name: "Yönetici",
      permissions: [
        { id: "sorun_olusturma", name: "Sorun Oluşturma", description: "Yeni sorun kaydı oluşturabilir", checked: true },
        { id: "sorun_guncelleme", name: "Sorun Güncelleme", description: "Mevcut sorunları güncelleyebilir", checked: true },
        { id: "sorun_silme", name: "Sorun Silme", description: "Sorun kayıtlarını silebilir", checked: true },
        { id: "sorun_atama", name: "Sorun Atama", description: "Sorunları kullanıcılara atayabilir", checked: true },
        { id: "rapor_goruntuleme", name: "Rapor Görüntüleme", description: "Raporları görüntüleyebilir", checked: true },
        { id: "ayarlar_yonetimi", name: "Ayarlar Yönetimi", description: "Sistem ayarlarını değiştirebilir", checked: true },
        { id: "kullanici_yonetimi", name: "Kullanıcı Yönetimi", description: "Kullanıcıları yönetebilir", checked: true },
      ]
    },
    {
      id: "destek",
      name: "Destek Personeli",
      permissions: [
        { id: "sorun_olusturma", name: "Sorun Oluşturma", description: "Yeni sorun kaydı oluşturabilir", checked: true },
        { id: "sorun_guncelleme", name: "Sorun Güncelleme", description: "Mevcut sorunları güncelleyebilir", checked: true },
        { id: "sorun_silme", name: "Sorun Silme", description: "Sorun kayıtlarını silebilir", checked: false },
        { id: "sorun_atama", name: "Sorun Atama", description: "Sorunları kullanıcılara atayabilir", checked: true },
        { id: "rapor_goruntuleme", name: "Rapor Görüntüleme", description: "Raporları görüntüleyebilir", checked: true },
        { id: "ayarlar_yonetimi", name: "Ayarlar Yönetimi", description: "Sistem ayarlarını değiştirebilir", checked: false },
        { id: "kullanici_yonetimi", name: "Kullanıcı Yönetimi", description: "Kullanıcıları yönetebilir", checked: false },
      ]
    },
    {
      id: "kullanici",
      name: "Kullanıcı",
      permissions: [
        { id: "sorun_olusturma", name: "Sorun Oluşturma", description: "Yeni sorun kaydı oluşturabilir", checked: true },
        { id: "sorun_guncelleme", name: "Sorun Güncelleme", description: "Mevcut sorunları güncelleyebilir", checked: false },
        { id: "sorun_silme", name: "Sorun Silme", description: "Sorun kayıtlarını silebilir", checked: false },
        { id: "sorun_atama", name: "Sorun Atama", description: "Sorunları kullanıcılara atayabilir", checked: false },
        { id: "rapor_goruntuleme", name: "Rapor Görüntüleme", description: "Raporları görüntüleyebilir", checked: false },
        { id: "ayarlar_yonetimi", name: "Ayarlar Yönetimi", description: "Sistem ayarlarını değiştirebilir", checked: false },
        { id: "kullanici_yonetimi", name: "Kullanıcı Yönetimi", description: "Kullanıcıları yönetebilir", checked: false },
      ]
    }
  ];

  // ID'ye göre rolü bul
  return defaultRoles.find(role => role.id === id);
};

// GET - Tek bir rolün detaylarını getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const role = getRoleById(params.id);

    if (!role) {
      return NextResponse.json(
        { error: "Rol bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error("Rol detayı alınırken hata:", error);
    return NextResponse.json(
      { error: "Rol detayı alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT - Mevcut bir rolü güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const role = getRoleById(params.id);
    
    if (!role) {
      return NextResponse.json(
        { error: "Rol bulunamadı" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, permissions } = rolSchema.parse(body);

    // Gerçek bir veritabanı bağlantısı olsaydı burada rol güncellemesi yapardık
    // Şimdilik başarılı olduğunu varsayalım

    // Tüm izinleri varsayılan olarak false yap ve sonra seçilileri true yap
    const updatedPermissions = role.permissions.map(p => ({
      ...p,
      checked: permissions.includes(p.id)
    }));

    const updatedRole = {
      ...role,
      name,
      permissions: updatedPermissions
    };

    return NextResponse.json(updatedRole);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Rol güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Rol güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE - Bir rolü sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const role = getRoleById(params.id);
    
    if (!role) {
      return NextResponse.json(
        { error: "Rol bulunamadı" },
        { status: 404 }
      );
    }

    // Önceden tanımlanmış rolleri silmeye izin verme
    if (["admin", "destek", "kullanici"].includes(params.id)) {
      return NextResponse.json(
        { error: "Varsayılan roller silinemez" },
        { status: 403 }
      );
    }

    // Gerçek bir veritabanı bağlantısı olsaydı burada rol silme işlemi yapardık
    // Şimdilik başarılı olduğunu varsayalım

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Rol silinirken hata:", error);
    return NextResponse.json(
      { error: "Rol silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 