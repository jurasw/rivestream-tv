# Rivestream TV — rozwój

## Reklamy i weryfikacje serwerów Embed

Przegląd pierwszych 15 serwerów Embed (Sintel, Dragon Ball Z S01E38; Chrome 155 i emulator WebView) jest w `.artifacts/server-audit/`. Aplikacja odrzuca nowe okna (`onCreateWindow`, `window.open` i linki `target` w ramkach dostawców), blokuje opuszczenie Rivestream podczas `/watch` i nawigację ramek do hostów reklamowych, a żądania do krótkiej listy `AD_HOSTS` z przeglądu dostają lokalną odpowiedź 204. `tv-ads.js` usuwa przezroczyste nakładki przechwytujące kliknięcia (`#dontfoid`), reklamy pełnoekranowe w shadow DOM (`doskip`/`prclck`) i z „Skip ad”, a także fałszywe kody QR „not a robot”. Odtwarzacz, wideo i lista serwerów pozostają nietknięte.

Aplikacja nie rozwiązuje ani nie klika captchy. Widoczny Cloudflare Turnstile, hCaptcha lub reCAPTCHA w ramce dostawcy pokazuje pasek z przyciskami Kursor (kursor pilota nad weryfikacją) i Serwery; serwer jest oznaczony „weryfikacja” na liście. Na czas weryfikacji usuwanie nakładek w tej ramce jest wstrzymane. Testy: `scripts/test-playback.sh` (23 kontrole reklam na lokalnych stronach) i `scripts/test-input.sh` (10 kontroli WebView).

## Auto next

W Ustawieniach, pod wyborem motywu, jest przełącznik **Auto next — następny odcinek** (domyślnie wyłączony) oraz czas pokazania przycisku: po zakończeniu albo 30–180 sekund przed końcem. Domyślnie przycisk pojawia się 90 sekund przed końcem, maksymalnie na ostatnie 10% odcinka. To przybliżenie outro na podstawie czasu wideo, nie rozpoznawanie napisów końcowych.

Przycisk **Następny odcinek** działa także przy wyłączonym auto next. Strzałka w dół podczas oglądania pokazuje sterowanie i ustawia fokus na tym przycisku. Po włączeniu auto next odliczanie trwa 15 sekund; można je anulować dla bieżącego odcinka. Pauza, buforowanie i przejście aplikacji w tło zatrzymują odliczanie. Timer snu blokuje przejście. Ustawienia `RiveTVPlaybackSettings` są zachowywane w prywatnej kopii danych Androida.

Przejście korzysta z dostępności i akcji następnego odcinka w Quick Menu strony, także na granicy sezonów; wymaga danych czasu od odtwarzacza Direct lub ramki dostawcy. Adapter odczytuje aktualne propsy komponentu React, gdy przyciski Quick Menu nie są zamontowane. Przy braku dostępnej akcji nie pokazuje przycisku ani nie zgaduje numeru odcinka. Zmiana struktury strony może wymagać aktualizacji adaptera.

Regresje: `scripts/test-playback.sh` — 62 kontrole preferencji, odliczania, pauzy, buforowania, anulowania, pilota, timera snu, końca serialu, aktualnego drzewa React i odrzucania spóźnionych komunikatów ramek oraz wspólnego odtwarzacza (JW Player, Plyr, Vidstack).

## Wspólny odtwarzacz

`tv-player.js` działa w każdej ramce. Ramka z głównym `<video>` (największym, gotowym) ukrywa interfejs dostawcy i rysuje własną nakładkę w Shadow DOM: tytuł, pasek postępu z podglądem, pauza, ±10 s, głośność, odcinki, audio i napisy, prędkość, następny odcinek, ekran pauzy, buforowanie i błąd. Klawisze pilota trafiają do niej komunikatami `riveTV:'key'` z numerem sekwencji, bo niektóre strony dostawców przekazują komunikaty dalej po kilka razy. Przycisk Serwery (lub Menu → Serwery) oddaje pilota kontrolkom strony; Wstecz wraca do nakładki. Dane odcinków pochodzą z aktualnego stanu React strony. Czcionka: `https://rivetv.assets/fonts/Inter-Variable.woff2` z zapasową bezszeryfową.

Lokalna aplikacja APK do obsługi **https://www.rivestream.app/** pilotem telewizora. Ma menu TV, zaznaczanie kafelków strzałkami, wyszukiwanie klawiaturą ekranową z jej systemowym dyktowaniem, listy wyboru dostosowane do pilota, pełny ekran odtwarzacza oraz przełączany kursor do osadzonych odtwarzaczy. Podczas oglądania menu boczne chowa się automatycznie. Historia, ustawienia strony i sesja są zapisywane w prywatnym WebView aplikacji.

## Wersja 1.8.0 — bez menu bocznego, wyszukiwanie jak w Netflix

Natywne menu boczne zostało usunięte. Ekran ładowania od startu pokazuje logo Rive ze spinnerem na całym ekranie. Ustawienia (ludek w prawym górnym rogu) mają ten sam górny pasek co strona główna; zakładki prowadzą z powrotem do przeglądania. Menu pilota nadal otwiera klawisz Menu.

Wyszukiwanie ma klawiaturę ekranową po lewej (mikrofon, spacja, kasowanie, a–z, 0–9), podpowiedzi tytułów pod nią i wyniki po prawej. Mikrofon otwiera systemowe rozpoznawanie mowy (`RecognizerIntent`, preferowany Google TV `com.google.android.katniss`), a rozpoznany tekst trafia do `RiveTV.search`. Przyciski odtwarzacza nie mają już szarego koła pod fokusem.

## Wersja 1.5.4 — płynność i wygląd jak w aplikacjach TV

Zmiany robocze odtwarzacza TV: osobny czas wznowienia dla filmu i każdego odcinka, także w zagnieżdżonych odtwarzaczach Embed. Ulubione, historia, postęp i ustawienia mają dodatkową kopię w prywatnych preferencjach Androida; aktualizacja tego samego pakietu z zachowaniem podpisu zachowuje dane. Odtwarzacz startuje automatycznie przez znane kontrolki dostawców i nie wznawia sam celowej pauzy. Interfejs początkowo jest schowany: Wstecz lub Dół odsłania kontrolki, kolejne Wstecz wraca; OK przełącza pauzę, Lewo/Prawo przewija o 10 s. Pomijanie intro zostało usunięte. „Następny odcinek” pojawia się jako sam przycisk z automatycznym zaznaczeniem dla pilota; odliczanie auto next jest na przycisku. OK na schowanym lub zaznaczonym odtwarzaczu przełącza pauzę i odtwarzanie, także na pełnym ekranie; przy widocznych kontrolkach OK nadal wybiera zaznaczony przycisk. Dostępność wideo nadal zależy od serwera i WebView. Kopia nie obejmuje tokenów zewnętrznych kont. Odinstalowanie lub wyczyszczenie danych aplikacji usuwa zapis.

Test zapisu Androida: po zbudowaniu i zainstalowaniu APK debug i androidTest uruchom `adb -s emulator-5580 shell am instrument -w -e viewingTests true app.rivestream.tv.test/app.rivestream.tv.InputRegressionTest`. Testy nawigacji obejmują również odtwarzacz w ramce o obcym pochodzeniu: start, pauzę i wznowienie przyciskiem OK, brak pomijania intro, zapis odcinków i zachowanie fokusu.

Strona trzymała klasę `skeleton` na wczytanych obrazkach, więc animacje ładowania działały bez końca i przerysowywały ekran co klatkę. Na Xiaomi Mi TV bezczynna strona główna zajmowała ~186% CPU; teraz ~3%, a mediana klatki przy przewijaniu spadła z 93 ms do 15 ms. Tło banera pobiera się w rozmiarze w1280 zamiast 4K, plakaty w w342 zamiast rozciąganych w185. Baner nie zmienia już tytułu co 15 s pod zaznaczonym przyciskiem Watch.

Rzędy pokazują 6 plakatów, siatki Filmy/Seriale wypełniają szerokość, zaznaczony plakat powiększa się z białą ramką. Strzałki w górę/w dół przechodzą do sąsiedniego rzędu, linki w nagłówkach sekcji nie łapią zaznaczenia, a strona serialu otwiera listę odcinków. Menu boczne nie ma już podpisu i podpowiedzi klawiszy (są w Menu pilota).

Wydanie zawiera wyłącznie `Rivestream-TV.apk`. Aktualizator czyta `https://api.github.com/repos/jurasw/rivestream-tv/releases/latest`: wersję z tagu `vX.Y.Z` i SHA-256 z pola `digest` assetu APK. `versionCode` wynika z wersji: `X*10000 + Y*100 + Z` (1.5.4 → 10504). Wersje 1.5.3 i starsze szukały `update.json`, więc do 1.5.4 trzeba je zaktualizować ręcznie.

## Wersja 1.5.3 — stabilne przewijanie

Powrót z menu bocznego, dialogu lub klawiatury nie przewija już strony na samą górę. Android WebView domyślnie zaznaczał wtedy pierwszy element strony i płynnie do niego przewijał, a zaznaczenie pilota zostawało niżej; `setNeedInitialFocus(false)` wyłącza to zachowanie. Pojedyncze naciśnięcia strzałek przewijają też wewnętrzne kontenery stron (wyszukiwanie, Filmy, Seriale, szczegóły), więc zaznaczony kafelek nie zostaje ucięty ani poza ekranem.

## Wersja 1.5.2 — aktualizacje z GitHuba

Repozytorium wydań: [jurasw/rivestream-tv](https://github.com/jurasw/rivestream-tv). Stały link do [najnowszego APK](https://github.com/jurasw/rivestream-tv/releases/latest/download/Rivestream-TV.apk).

Pierwszą wersję z aktualizatorem trzeba zainstalować ręcznie jako aktualizację dotychczasowej aplikacji. Kolejne wydania TV sprawdza po uruchomieniu/powrocie do aplikacji oraz co 6 godzin podczas działania. Pobieranie odbywa się w tle; automatyczna instalacja czeka na opuszczenie odtwarzacza i zamknięcie klawiatury/dialogów. Ręczne sprawdzenie: Menu pilota → Aktualizacje. „Później” odkłada daną wersję; ręczne sprawdzenie pozwala do niej wrócić. Nowsze wydania nadal są wykrywane.

Telewizor musi zezwolić Rivestream TV na instalowanie aktualizacji. Aplikacja otwiera odpowiednie ustawienia, gdy aktualizacja jest gotowa. Na Androidzie 9 instalator systemowy może wymagać zatwierdzenia pilotem. Na Androidzie 12+ aplikacja prosi system o aktualizację własnego pakietu bez dodatkowego potwierdzenia; obsługuje też przypadek, gdy system mimo to wymaga zgody. Google Play Protect może dodatkowo poprosić o potwierdzenie nieznanego dewelopera, również na nowszym Androidzie. Na Androidzie 9 aplikacja może uruchomić się ponownie po instalacji. Na Androidzie 10+ otwórz ją z ikony w menu TV — system ogranicza samoczynne otwieranie ekranów po wymianie APK. Zakończenie aktualizacji obsługuje odbiornik instalacji i MY_PACKAGE_REPLACED, niezależnie od zamknięcia starego procesu. Szczegóły platformy: [PackageInstaller.SessionParams](https://developer.android.com/reference/android/content/pm/PackageInstaller.SessionParams#setRequireUserAction(int)).

Informacje o wydaniu pochodzą z GitHub API najnowszego wydania (od 1.5.4; wcześniej `update.json`). Pobieranie dopuszcza HTTPS i serwery GitHuba, ogranicza rozmiar, sprawdza SHA-256 oraz zgodność identyfikatora, nowszej wersji i certyfikatu podpisu APK z zainstalowaną aplikacją. Nie wymaga konta GitHub, tokena, dostępu do pamięci współdzielonej ani uprawnień administratora TV. Klucz podpisu pozostaje lokalnie. W parserze archiwum APK używane są oba znaczniki `GET_SIGNATURES` i `GET_SIGNING_CERTIFICATES`, ponieważ Android 13 bez starszego znacznika nie zbiera certyfikatów archiwum.

Publikowanie następnej wersji: zwiększ versionName i odpowiadający mu versionCode w `app/build.gradle`, wykonaj testy, zapisz opis do pliku i uruchom `./scripts/publish-release.sh <opis.md> [gałąź]`. Skrypt sprawdza ciągłość podpisu, tworzy roboczy release z samym APK, pobiera go z GitHuba do weryfikacji, oznacza wydanie jako Latest i porównuje `digest` z GitHub API. Klucz podpisu nigdy nie trafia do repozytorium.

Pełna próba dystrybucji korzysta z APK pobranego z publicznego GitHub Release. Potwierdzono przejście z testowej wersji 1.5.1 (kod 11) do opublikowanej 1.5.2 (kod 12), zakończenie instalacji przez odbiornik i otwarcie nowej aplikacji. Test sprawdza weryfikację, pozostawienie starej wersji podczas otwartego `/watch`, rozpoczęcie instalacji po powrocie na Start, potwierdzenia wymagane przez Google Play Protect oraz otwarcie nowej aplikacji z menu TV. Dowód: `.artifacts/update-e2e.json` i `.artifacts/update-e2e-logcat.log`. Nie jest to potwierdzenie instalacji bez zgody systemowej na każdym telewizorze.

Testy aktualizatora: `./scripts/test-updates.sh`. Sprawdzają rzeczywiste podpisane APK, obcy certyfikat, uszkodzony plik, wersję, adresy pobierania oraz otwarcie i anulowanie systemowego instalatora. Pliki testowych wydań i klucz testowy pozostają w ignorowanym `.artifacts/`.

## Wersja 1.4.1 — rzeczywiste źródła, dostęp do kontrolek i płynne przewijanie

Usunięto potwierdzoną awarię Direct: strona bez sprawdzenia dostępności wywołuje `new MediaMetadata` i `navigator.mediaSession.metadata`, a WebView Android TV nie zapewnia tych interfejsów. Warstwa zgodności przechowuje metadane i przyjmuje opcjonalne wywołania integracji systemowej; nie zastępuje natywnej usługi Media Session. Klawisze multimedialne pilota nadal obsługuje aplikacja. Istniejące implementacje przeglądarki pozostają zachowane.

Przy błędzie odtwarzacza pasek zawiera niezależne przyciski Direct i Embed. Po błędzie natywne menu w prawym dolnym rogu pozwala wybrać tryb, serwer i opcje aplikacji, także po utracie całego interfejsu strony. Przełączenie trybu zapisuje preferencje używane przez stronę i ponownie uruchamia odtwarzacz. Pilot może wejść do tych kontrolek również bez jakichkolwiek elementów HTML. Oryginalne Quick Menu strony pozostaje dostępne, gdy strona działa.

Strzałka zatwierdzająca klawiatury TV obsługuje też akcję IME Next. Zapisuje tekst, zamyka klawiaturę i przenosi fokus na wyniki. Przytrzymanie pilota korzysta z jednego animatora przewijania, który płynnie zmienia cel; odcinki wybiera w kolejności DOM, z odstępem 150 ms między powtórzeniami. Nie kolejkuje komend po puszczeniu.

Sprawdzono rzeczywisty Embed w WebView 101 na emulatorze Android TV:

| Tytuł | Embed Server 1 (VidsrcMe) | Embed Server 2 (Best-Server) |
| --- | --- | --- |
| Dragon Ball Z, Saiyan Saga, S01E38 „Nursing Wounds” | Odtwarzanie 1920×1080, zdekodowane klatki i obraz potwierdzony zrzutem Android TV | HTTP 403 endpointu PrimeSrc i weryfikacja Cloudflare |
| Spider-Man: Brand New Day, TMDB 969681 | Odtwarzanie 1920×800, zdekodowane klatki i obraz potwierdzony zrzutem Android TV | HTTP 403 endpointu PrimeSrc i weryfikacja Cloudflare |

W ponownej próbie Direct dla Spider-Mana usunięto wyjątek `MediaMetadata` i zachowano interfejs: strona wybrała Apogee (1080p), ale źródło nie dostarczyło zdekodowanych klatek (readyState 0, czas 0). Dostępność Direct nie została potwierdzona. Działającą ścieżką w tych próbach był Embed → Server 1. Szczegóły: `.artifacts/spiderman-direct-play-fixed.json`.

Dowody: `.artifacts/dbz-embed-server1.json`, `.artifacts/dbz-embed-server1-tv.png`, `.artifacts/spiderman-embed-server1.json`, `.artifacts/spiderman-embed-server1-tv.png`. To próby uruchomienia wskazanych źródeł, nie test całego materiału ani fizycznego MiTV. Zrzut `Page.captureScreenshot` WebView może pomijać sprzętową powierzchnię wideo — obraz weryfikowano przez zrzut całego ekranu Androida.

Walidacja: 89 testów przeglądarkowych, 21 testów Android TV i 8 kontroli na rzeczywistej liście odcinków. Dodatkowy test rzeczywistej listy 39 odcinków uruchamia się przez `adb shell am instrument -w -e liveNavigation true app.rivestream.tv.test/app.rivestream.tv.InputRegressionTest`; sprawdza przytrzymanie obu kierunków, kolejność odcinków, klatki pośrednie przewijania i zatrzymanie. Log: `.artifacts/dbz-live-navigation-test.log`.

## Wersja 1.4.0 — przytrzymanie pilota, klawiatura i komunikaty

Komunikaty błędów są małym paskiem z Odśwież i Zamknij. Po HTTP 403 endpointu odtwarzania PrimeSrc pasek proponuje Serwery i otwiera dialog wyboru źródła. Nie zasłaniają całej strony ani nie zabierają jej fokusu; strzałka w górę przy początku treści pozwala wejść do paska. Jeśli strona sama odzyska gotowość, pasek znika.

Przytrzymanie strzałki nie kolejkuje każdego powtórzenia w WebView. Jedno polecenie jest przetwarzane naraz, a puszczenie zatrzymuje dalsze kroki. Powtórzenia przewijają bez ponownego uruchamiania animacji; góra/dół pomija inne przyciski tego samego odcinka. Ograniczono powtarzane odczyty stylów podczas zbierania elementów.

Pole wyszukiwania podczas edycji jest standardowym EditText Androida, umieszczonym nad polem strony w tej samej pozycji. Korzysta z klawiatury i jej dyktowania; tekst aktualizuje wyszukiwarkę. Zatwierdzenie i Wstecz zapisują tekst, chowają klawiaturę i oddają sterowanie poza pole. Pozostałe pola WebView obsługują akcje IME Done/Search/Go oraz Enter. Odpuszczenie klawisza zatwierdzenia po zamknięciu klawiatury nie aktywuje pola ponownie.

Walidacja: 85 testów przeglądarkowych oraz 16 testów na urządzeniu Android TV z lokalną stroną kontrolną. Testy urządzenia sprawdzają ruch w trakcie przytrzymania, zatrzymanie po puszczeniu, rozmiar i fokus komunikatu błędu, obecność rzeczywistego okna klawiatury, przekazanie jej strzałek, zapis tekstu oraz zniknięcie okna IME po zatwierdzeniu. Uruchomienie: `./scripts/test-input.sh` przy działającym emulatorze projektu. Testy korzystają wyłącznie z pakietu androidTest; nie dodają uprawnień ani narzędzi automatyzacji do release.

Sprawdzono prawdziwy Embed dla filmu Sintel (TMDB 45745) w WebView 101 emulatora Android TV, bez podmieniania ramki na MP4. Server 1 (VidsrcMe) odtworzył obraz 1920×1080; pomiar wideo: readyState 4, paused false, czas ponad 56 s, a zrzut ekranu potwierdził obraz filmu. Server 2 (Best-Server/PrimeSrc) zwrócił HTTP 403 i weryfikację Cloudflare zarówno na TV, jak i w Chrome 155. To test tych źródeł i filmu; nie jest testem wszystkich tytułów ani fizycznego MiTV. Dowody lokalne: `.artifacts/embed-current.json`, `.artifacts/tv-embed-server1.png`, `.artifacts/tv-embed.log`.

## Wersja 1.3.0 — pojedynczy dialog wyboru i klawiatura systemowa

Listy sezonów i pozostałe własne listy strony pokazują wyłącznie dialog TV. Lista HTML jest ukrywana przed kliknięciem otwierającym i pozostaje ukryta również przez animację zamykania. Opcje są przekazywane do dialogu, a wybór uruchamia obsługę strony i przywraca fokus na polu. W razie nieudanego otwarcia aplikacja zamyka stan wyboru i pozwala spróbować ponownie. Usunięto dodatkowe dyktowanie z aplikacji; pozostaje funkcja klawiatury systemowej. Łącznie 76 testów regresji. Dodatkowo poprawiono początkowy fokus, gdy dane banera pojawiają się później niż zakładki.

Porównano rzeczywiste możliwości lokalnego Chrome 155 i emulatora Android TV z WebView 101. TV nie obsługuje `dvh` ani natywnego `Object.groupBy`; Chrome obsługuje oba. Poprawki aplikacji zapewniają wysokość odtwarzacza i zastępcze `groupBy` także wewnątrz ramek dostawców. Oba silniki zgłosiły obsługę H.264 i VP9 przez `canPlayType`; nie zadeklarowały HEVC. Te deklaracje nie potwierdzają dekodowania dowolnego strumienia ani działania konkretnego DRM. Raport pomiaru: `.artifacts/tv-browser-compatibility.json`. Fizyczny MiTV nie jest połączony z ADB, więc jego silnika i sprzętowych dekoderów nie zweryfikowano. Obsługa funkcji zależy od kombinacji Androida i pakietu WebView — zobacz [WebViewFeature](https://developer.android.com/reference/androidx/webkit/WebViewFeature).

## Wersja 1.2.2 — zgodność odtwarzacza i widoczność obrazu

Dodano zastępcze `Object.groupBy` do wszystkich ramek przed skryptami dostawców: w WebView 101 odtwarzacz PrimeSrc kończył się błędem braku tej metody. Skrypt zgodności nie zawiera ustawień ani mostka natywnego. Właściwe ustawienia nadal inicjalizowane są wyłącznie w domenie Rivestream.

Stan awarii strony jest rozpoznawany po widocznym nagłówku błędu aplikacji, a nie po dowolnym tekście w dokumencie (np. ukrytym komunikacie lub zapowiedzi dla czytnika ekranu). Widoczny odtwarzacz i natywny pełny ekran mają pierwszeństwo przed zasłaniającym ekranem błędu. Kontener Watch oraz jego iframe mają jawne `100vh`, niezależne od pobieranej poprawki jednostek `dvh`.

Dodano 11 testów regresji; łącznie 69 testów nawigacji, zgodności i wykrywania awarii. W emulatorze potwierdzono wyświetlanie publicznego zwiastuna Sintel MP4 z download.blender.org w osadzonej ramce oraz pełną wysokość PrimeSrc i obecność poprawki `groupBy` wewnątrz jego domeny. Był to osobny test wyjścia wideo przez tymczasową zmianę adresu ramki w narzędziach debugowania; nie stanowi potwierdzenia odtwarzania filmu przez źródła Rivestream. Po teście przywrócono oryginalny adres dostawcy.

## Wersja 1.2.1 — wybór sezonu pilotem

Strzałka w dół z Episodes trafia do szerokiej listy sezonów zamiast pomijać ją na rzecz węższych przycisków odcinków. OK otwiera listę TV zarówno dla panelu desktopowego, jak i mobilnego wariantu strony; strzałki wybierają sezon, a OK zatwierdza. Po zamknięciu listy fokus wraca do wyboru sezonu; kolejna strzałka w dół prowadzi do odcinków. Dodano sześć testów obejmujących układ z szeroką listą, otwieranie, wybór i powrót fokusu (łącznie 58 testów).

## Wersja 1.2.0 — ładowanie, szczegóły i odtwarzacz

Ekran ładowania pozostaje widoczny do pojawienia się użytecznej treści i znika płynnie po narysowaniu strony. Przejścia między sekcjami również pokazują ten ekran; po błędzie lub 30 sekundach oczekiwania można ponowić ładowanie. Usunięto dodatkowy pasek postępu strony.

Menu rozwija się i zwija przez 240 ms nad treścią. Szerokość WebView pozostaje stała, więc katalog nie przeskakuje ani nie zmienia układu przy każdym przejściu fokusu. Podpisy menu pojawiają się płynnie, a ikony pozostają na swoich miejscach.

Pilot obsługuje zakładki Episodes, Overview, Casts, Reviews i Related. Przejście w dół z banera prowadzi do zakładek; lewo/prawo wybiera zakładkę, OK ją otwiera. Opóźnione centrowanie zakładek przez stronę nie przewija już pionowo całej strony. Początkowy fokus nie przewija katalogu do kontrolek pojawiających się poniżej ekranu.

Naprawiono uchwycony wyjątek `Cannot read properties of null (reading 'syncProgress')`: brakujące lub uszkodzone ustawienia są inicjalizowane przed skryptami strony za pomocą [WebViewCompat.addDocumentStartJavaScript](https://developer.android.com/reference/androidx/webkit/WebViewCompat#addDocumentStartJavaScript(android.webkit.WebView,java.lang.String,java.util.Set)). Prawidłowe preferencje są zachowane, uszkodzony zapis otrzymuje kopię `RiveTVSettingsBackup`. Starsze silniki bez tej funkcji dostają inicjalizację przy rozpoczęciu i zatwierdzeniu ładowania. Błąd aplikacji strony wyświetla teraz ekran ponowienia zamiast pozostawiać użytkownika bez działających kontrolek.

Testy: 52 przypadki nawigacji i regresji, kompilacja debug/release i Android Lint. Uruchomienie odtwarzacza nie oznacza dostępności źródła: testowy Sintel przeszedł do trybu Embed po błędach serwerów Direct; odtwarzania filmu od początku do końca nie potwierdzono.

## Wersja 1.1.1 — zwijane menu

Po przejściu do treści menu zwija się do samych ikon (84 dp). Strzałka w lewo przy krawędzi treści rozwija menu z podpisami (180 dp). Pozycje ikon pozostają stałe. Kreska aktywnej pozycji ma osobny odstęp od ikony; usunięto padding tła, który wcześniej przesuwał ją w stronę symbolu. Podpisy przycisków są zachowane dla dostępności również w trybie ikon.

## Wersja 1.1.0 — wygląd i pilot

Grafitowe tło, złoty akcent Rivestream, białe zaznaczenie i nowy znak RVE z różowo-pomarańczowym gradientem. Usunięto grube ramki i dekoracyjne narożniki strony. Menu boczne, okna aplikacji i listy wyboru mają wspólne odstępy i zaznaczenia. Fokus znika po przejściu do menu lub okna i wraca na poprzedni element; nie zaznacza zagnieżdżonych etykiet zamiast całego przycisku.

Pliki logo: `assets/brand/rivestream-mark.svg`, `rivestream-logo.svg`, `rivestream-icon.png`. Znak nawiązuje do [oryginalnego logo Rive](https://www.rivestream.app/images/logo512.png); jest częścią lokalnej aplikacji TV.

Wyszukiwanie korzysta z klawiatury ekranowej systemu, w tym z jej przycisku dyktowania. Usunięto dodatkowy przycisk Mikrofon i pozycję Szukaj głosowo z aplikacji. Klawisz Search otwiera wyszukiwarkę; klawisze Asystenta pozostają obsługiwane przez system telewizora. Dostępność mikrofonu klawiatury zależy od zainstalowanej klawiatury i usług TV.

Standardowe listy HTML `select` oraz własne listy Rivestream otwierają okno TV: strzałki wybierają, OK zatwierdza, Wstecz anuluje. Nieaktywne opcje są pomijane. Suwaki reagują na lewo/prawo. Po wejściu OK do osadzonego odtwarzacza Wstecz najpierw wraca do przycisków i wyboru źródła. Zewnętrzne odtwarzacze mogą nadal wymagać kursora, bo aplikacja nie ma dostępu do wnętrza obcej domeny.

## Twój telewizor

Ze zdjęcia: **MiTV-MSSP3, Android 9, poprawki 5 lipca 2020, kompilacja PI.4663**. APK ma `minSdk 28` (Android 9), nie zawiera bibliotek zależnych od procesora i obsługuje ARM 32/64 bit. Aplikacja korzysta z Android System WebView telewizora. Dodano zastępowanie jednostek CSS `dvh`/`svh`/`lvh` przez `vh` w starszych silnikach, aby odtwarzacz zachował prawidłową wysokość.

Testy lokalne wykonano na **prawdziwym obrazie Android TV 13 / API 33, ARM64, 1920×1080**, z WebView 101. To emulator dla Apple Silicon; nie odtwarza dokładnie sprzętu ani systemu Android 9 ze zdjęcia. Test na fizycznym telewizorze wymaga instalacji APK.

Potwierdzono budowę debug/release, podpis APK, 85 testów nawigacji, Android Lint bez błędów, uruchomienie z phrocs, katalog i plakaty, otwieranie szczegółów filmu, klawiaturę ekranową i wyszukiwanie oraz pełną wysokość osadzonego odtwarzacza po poprawce WebView (540 zamiast 150 pikseli CSS). W teście serwer zewnętrzny dla filmu Sintel pozostał na ekranie ładowania; odtwarzanie filmu z Rivestream od początku do końca nie zostało potwierdzone.

## Uruchomienie emulatora

W tym katalogu uruchom:

```sh
phrocs
```

Możesz też kliknąć dwukrotnie **Uruchom-TV.command**. Proces `rivestream-tv` automatycznie uruchomi emulator, zbuduje APK debug, zainstaluje aplikację i ją otworzy. Pierwszy start emulatora może potrwać około minuty. Emulator ma osobny profil `Rivestream_TV_API33` i port `5580`.

W phrocs: `s` uruchamia wybrany proces, `x` zatrzymuje, `r` uruchamia ponownie, `q` zamyka. Jeśli skrypt uruchomił emulator, zatrzymanie procesu zamyka również ten emulator. Już działający emulator tego profilu jest ponownie używany i pozostaje otwarty po zatrzymaniu procesu. Skrypt nie wybiera innych urządzeń ADB.

Pozostałe procesy: `build-apk` tworzy APK do telewizora, `android-logs` pokazuje błędy aplikacji, `android-lint` uruchamia analizę Android Lint.

Bez phrocs:

```sh
./scripts/run-tv.sh
```

Aby uruchomić dokładnie wersję release przeznaczoną do telewizora: `RIVE_APK_VARIANT=release ./scripts/run-tv.sh`. Domyślne uruchomienie przez phrocs używa wersji debug, ułatwiającej diagnostykę.

Emulator domyślnie używa renderowania SwiftShader z wyłączonym Vulkanem oraz zimnego startu, aby uniknąć zawieszeń sterownika na tym Macu. Można przetestować inne renderowanie przez `RIVE_GPU=host ./scripts/run-tv.sh`. Instalacja i uruchomienie mają limity czasu, więc zawieszony emulator nie blokuje procesu bez końca.

## Instalacja na TV

Gotowy plik to **Rivestream-TV.apk** w głównym katalogu projektu (kopia w `.artifacts/rivestream-tv.apk`). Skopiuj go na pendrive, otwórz menedżerem plików na TV i zezwól temu menedżerowi na instalowanie aplikacji z tego źródła. Po instalacji aplikacja pojawia się jako **Rivestream TV** w menu aplikacji.

Jeżeli TV udostępnia ADB w sieci, włącz debugowanie w opcjach programistycznych i uruchom, podstawiając adres telewizora:

```sh
./scripts/install-tv.sh 192.168.1.100
```

Zatwierdź połączenie debugowania na ekranie TV. Skrypt instaluje aplikację i ją otwiera. Nie przeprowadza automatycznego wyszukiwania urządzeń w sieci.

## Sterowanie

| Przycisk | Działanie |
|---|---|
| Strzałki | Wybór kafelków, przycisków i pól |
| OK / Enter | Otwórz wybrany element |
| Przytrzymanie OK | Włącz / wyłącz kursor |
| Strzałki w trybie kursora | Przesuń kursor; góra/dół przy krawędzi przewija stronę |
| OK w trybie kursora | Kliknij, także w odtwarzaczu innej domeny |
| Wstecz / Esc | Zamknij klawiaturę, pełny ekran lub wróć na poprzednią stronę |
| Menu / F1 | Opcje, odświeżenie, kursor, menu boczne, pomoc |
| Search | Otwórz wyszukiwarkę; dyktowanie jest dostępne w klawiaturze systemowej |
| Przewijanie w przód / w tył | Przeskok o 10 sekund w dostępnym wideo |
| Play / pauza | Sterowanie wideo dostępnym dla strony; zewnętrzne odtwarzacze mogą wymagać kursora |

W emulatorze można używać strzałek klawiatury i Enter oraz przycisku Back w emulatorze. Do pól tekstowych można pisać z klawiatury komputera.

## Budowanie i narzędzia

```sh
./scripts/build.sh release
./scripts/build.sh debug
source scripts/env.sh
./gradlew --no-daemon :app:lint
./scripts/test-navigation.sh
```

Ostatnia komenda uruchamia 85 testów nawigacji w lokalnym Chrome; wynik jest w `.artifacts/navigation-test.html`. Log zamykania przeglądarki testowej jest osobnym plikiem `.artifacts/navigation-test-browser.log`.

Skrypty używają JDK 17+, Android SDK 35, Build Tools 35, Gradle 8.9 i Android Gradle Plugin 8.7.3. Na tym komputerze JDK oraz podstawowe składniki SDK są podłączone z istniejącego katalogu `../bb-tv/.tools` w celu oszczędzenia miejsca. Obraz i profil emulatora Rivestream są osobne. Nie usuwaj narzędzi projektu `bb-tv`, jeśli nadal korzystasz z tych lokalnych dowiązań.

Na innym komputerze ustaw `JAVA_HOME` i `ANDROID_HOME` na istniejącą instalację albo uruchom **scripts/setup.sh**. Skrypt dla macOS pobiera oficjalne Android Command-line Tools, pyta o licencje SDK, instaluje wymagane składniki i tworzy emulator. Jeśli przenosisz folder razem z `.tools`, najpierw usuń wyłącznie niedziałające dowiązania lokalnych narzędzi. Android Studio może otworzyć ten projekt; w razie zmiany SDK zaktualizuj `local.properties`.

Podpis APK do lokalnej instalacji jest zachowywany w `~/.android/rivestream-tv.keystore`, dzięki czemu kolejne kompilacje aktualizują tę samą aplikację. To klucz do prywatnego sideloadingu; nie jest przygotowany do publikacji w sklepie. Zachowaj go, jeśli chcesz aktualizować APK bez odinstalowywania. Wersja release wyłącza zdalne debugowanie WebView; wersja debug umożliwia diagnostykę.

## Zależność od strony

Aplikacja wyświetla działającą stronę Rivestream, bez kopiowania katalogu i bez prywatnego API. Wymaga internetu. Poszczególne filmy, serwery, napisy i logowanie zależą od strony i jej dostawców. Zablokowane źródło lub wymagany przez dostawcę DRM nie zostają odblokowane przez APK. Gdy odtwarzacz nie obsługuje strzałek, użyj kursora; gdy strona nie działa na TV, sprawdź wersję WebView w menu pomocy i dostępne aktualizacje Android System WebView / Chrome.

Zasady integracji TV i WebView opisuje dokumentacja [Android TV](https://developer.android.com/training/tv/get-started/create) oraz [Android WebView](https://developer.android.com/develop/ui/views/layout/webapps/webview).
