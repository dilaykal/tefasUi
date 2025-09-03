# Fon Takip Sistemi

Bu depo, Spring Boot API'ye bağlanan ve fon verilerini görselleştiren **React** tabanlı bir kullanıcı arayüzü içerir.

## İçindekiler

- [Teknolojiler](#-teknolojiler)
- [Özellikler](#-özellikler)
- [Kurulum](#-kurulum)
- [API Bağlantısı](#-api-bağlantısı)
- [Kullanım ve Ekran Görüntüleri](#-kullanım-ve-ekran-görüntüleri)
- [Testler](#-testler)

---

## Teknolojiler

Bu proje, aşağıdaki temel teknolojileri kullanarak geliştirilmiştir:

-   **React:** Kullanıcı arayüzü için temel JavaScript kütüphanesidir.
-   **React Router DOM:** Sayfa geçişlerini ve URL yönetimini sağlar.
-   **Tailwind CSS:** Hızlı ve modern bir tasarım için kullanılan CSS kütüphanesidir.
-   **Heroicons:** İkonların kullanımı için gerekli kütüphanedir.
-   **Axios:** API'ye HTTP istekleri göndermek için kullanılır.

---

## Özellikler

-   **Tüm Fonları Görüntüleme:** Kullanıcılar, API'den çekilen tüm fonların güncel getirilerini listeleyebilir.
-   **Sıralama ve Filtreleme:** Fon tablosundaki veriler, sütun başlıklarına göre sıralanabilir.
-   **Excel'e Aktarma:** Görüntülenen fon verilerini CSV formatında Excel'e aktarır.
-   **Fona Göre Arama:** Belirli bir fon kodunu veya tarih aralığını kullanarak arama yapma imkanı sunar.
-   **Getiri Güncelleme:** Kullanıcıların, fon getirilerini manuel olarak düzenleyebilmesi için bir arayüz sağlar.

---

## Kurulum

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları takip edin:

1.  Bu depoyu klonlayın:
    ```bash
    git clone https://github.com/dilaykal/tefasUi.git
    ```
2.  Proje dizinine gidin:
    ```bash
    cd tefasUi
    ```
3.  Gerekli kütüphaneleri yükleyin:
    ```bash
    npm install
    ```
4.  Spring Boot API uygulamasının çalıştığından emin olun.
5.  Uygulamayı çalıştırın:
    ```bash
    npm start
    ```

Uygulama, varsayılan olarak `http://localhost:3000` adresinde çalışmaya başlayacaktır.

---

## API Bağlantısı

Bu frontend uygulaması, şu adresteki API'ye bağlanır: `http://localhost:8080`.

Bağlantı ayarları, .env dosyası içinde tanımlanmıştır. Eğer API farklı bir adreste çalışıyorsa, bu adresi güncellemeniz gerekmektedir.

---

## Kullanım ve Ekran Görüntüleri

-   **Tüm Fonlar Sayfası:** Tüm fonları güncel getirileriyle listeler. Sütun başlıklarına tıklayarak sıralama yapabilir ve Excel'e aktarma butonuyla verileri indirebilirsiniz.
<img width="1686" height="907" alt="image" src="https://github.com/user-attachments/assets/e4495836-e0f7-4489-aa3b-07aa0e252006" />



-   **Fona Göre Arama Sayfası:** Belirli bir fon kodunu arayabilir, tarih aralığı belirterek o fona ait geçmiş verileri görüntüleyebilirsiniz. Ayrıca, verileri düzenlemek için düzenleme butonuna tıklayarak getiri değerlerini güncelleyebilirsiniz.
<img width="1701" height="908" alt="image" src="https://github.com/user-attachments/assets/ea31ab46-0156-4882-a2a9-751ec97c92ee" />



---