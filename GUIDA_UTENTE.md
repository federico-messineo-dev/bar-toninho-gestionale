# Guida Utente — Caffè Toninho

App di gestione magazzino e menu per il Caffè Toninho. Offline-first con sincronizzazione cloud.

---

## 1. Login

All'avvio appare la schermata di accesso.

Inserisci email e password, poi premi **Accedi**. Le credenziali vengono validate tramite Supabase. La sessione persiste anche chiudendo il browser.

Se sei offline e hai già effettuato accesso in precedenza, l'app ti riconosce automaticamente.

---

## 2. Dashboard

Dopo il login vedi la **Panoramica** con:
- **Prodotti Totali** — numero di prodotti nel database
- **Scorte in Esaurimento** — prodotti con scorte pari o inferiori al minimo
- **Menu QR Attivi** — stato del menu QR
- **Vendite Oggi** — totale vendite della giornata

In basso c'è una lista scorrevole dei **prodotti in esaurimento** con pulsante rapido per rifornire.

---

## 3. Cerca un Prodotto

Vai alla sezione **Prodotti** dal menu laterale (desktop) o dalla barra in basso (mobile).

- Usa la **barra di ricerca** per cercare per nome, categoria o fornitore
- Tocca le **chip delle categorie** (es. Vino, Grappa, Birra) per filtrare
- I risultati si aggiornano in tempo reale

---

## 4. Modifica Prezzo e Giacenza

1. Tocca un prodotto nella lista
2. Premi l'**icona matita** (in alto a destra) per entrare in modalità modifica
3. Modifica i campi desiderati: nome, prezzo, scorte, scorte minime, fornitore, codice a barre, note
4. Premi **Salva Modifiche**

Le modifiche vengono salvate localmente e sincronizzate con il cloud quando sei online.

---

## 5. Registrare una Vendita Veloce

Dalla schermata dettaglio prodotto:
- Premi il pulsante rosso **Vendi (-1)** per registrare una singola vendita
- La scorta si riduce automaticamente di 1
- Il movimento viene registrato nello storico

Per vendite multiple, ripeti l'operazione.

---

## 6. Rifornire un Prodotto

Dalla schermata dettaglio prodotto:
- Premi il pulsante verde **Rifornisci (+1)** per aggiungere 1 unità
- Dalla dashboard, premi **Rifornisci** sulle card dei prodotti in esaurimento

---

## 7. Menu QR con i Clienti

Vai alla sezione **Menu QR** dal menu.
- Vedi il codice QR del menu pubblico
- Premi **Apri Menu** per visualizzare il menu come lo vedono i clienti
- Mostra il codice QR al cliente oppure condividi il link

Il menu pubblico mostra tutti i prodotti attivi, organizzati per categoria, con prezzi.

---

## 8. Aggiungere o Cambiare una Foto Prodotto

1. Vai al dettaglio di un prodotto
2. Premi l'**icona matita** per modificare
3. Nella sezione **Foto Prodotto**:
   - **Carica foto** — seleziona un'immagine dalla galleria
   - **Scatta foto** — apre la fotocamera del telefono
4. Vedi l'**anteprima** prima di salvare
5. Se c'è già una foto, premi il pulsante ✕ per rimuoverla
6. Premi **Salva Modifiche**

Se sei online, la foto viene caricata su Supabase Storage. Se sei offline, viene salvata localmente e caricata appena torni online. Limite massimo: 5MB per immagine.

---

## 9. Avvisi Scorte

- Quando un prodotto raggiunge le **scorte minime** (default: 2), appare un indicatore rosso sulla card
- Quando le scorte sono **zero**, l'indicatore diventa grigio scuro
- Sulla **dashboard**, i prodotti in esaurimento appaiono nella sezione dedicata con un'icona di avviso animata
- Dalla dashboard puoi rifornire rapidamente con un tocco

---

## 10. Gestione Utenti (solo Admin)

Gli amministratori possono:
- Vedere la lista di tutti gli utenti
- Aggiungere nuovi utenti (nome + ruolo Staff o Admin)
- Rimuovere utenti (tranne l'admin principale)

---

## 11. Sincronizzazione Cloud

L'app sincronizza automaticamente i dati con Supabase quando sei online.

**Indicatore di stato** (pallino in alto a destra nella barra mobile):
- **Verde** — online e sincronizzato
- **Giallo** — ci sono modifiche in attesa di sincronizzazione
- **Rosso** — offline
- **Grigio** — Supabase non configurato (modalità solo offline)

Quando torni online dopo un periodo di offline, le modifiche vengono sincronizzate automaticamente.

---

## Note Tecniche

- L'app funziona **completamente offline** dopo il primo caricamento
- I dati sono salvati nel database del browser (IndexedDB)
- Le modifiche persistono anche chiudendo e riaprendo l'app
- Quando online, i dati vengono sincronizzati con Supabase (auth + database + storage)
- Il menu pubblico si aggiorna automaticamente con le modifiche ai prodotti
- La PWA può essere installata sul telefono come un'app nativa
