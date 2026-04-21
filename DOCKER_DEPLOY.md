# 📄 Guia de Seleção e Deploy Docker - DITEL/PMPA

Este documento fornece as instruções necessárias para o pessoal da **Seção de Telemática (DITEL)** realizar a implantação do sistema usando **Docker**.

## 🚀 Como subir o sistema (Instalação Rápida)

Certifique-se de que o **Docker** e o **Docker Compose** estão instalados no servidor Linux/Windows.

1.  **Clone o Repositório ou Copie os Arquivos**
2.  **Configuração de Segurança**:
    Abra o arquivo `docker-compose.yml` e altere o `JWT_SECRET` para uma chave forte e única.
3.  **Início do Sistema**:
    No terminal, dentro da pasta do projeto, execute:
    ```bash
    docker-compose up -d --build
    ```

---

## 🛠 Comandos Úteis de Manutenção

- **Ver logs em tempo real**:
  ```bash
  docker logs -f ditel-app
  ```
- **Reiniciar o sistema**:
  ```bash
  docker-compose restart app
  ```
- **Parar tudo**:
  ```bash
  docker-compose down
  ```

---

## 🔐 Variáveis de Ambiente (Configuração Fina)

As variáveis podem ser passadas diretamente no `docker-compose.yml` na seção `environment`:

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `MONGODB_URI` | Link de conexão com o Banco | `mongodb://db:27017/ditel_db` |
| `JWT_SECRET` | Chave de criptografia dos Tokens | (Troque para uma chave secreta) |
| `PORT` | Porta interna do container | `5001` |

---

## 💾 Backup dos Dados

Os dados do MongoDB estão mapeados para um volume chamado `ditel_data`. Em servidores Linux, você os encontrará geralmente em `/var/lib/docker/volumes/ditel_data`. 

> [!IMPORTANT]
> **Segurança**: Certifique-se de fechar a porta 27017 do servidor no firewall externo, permitindo acesso apenas internamente entre os containers ou via túnel seguro.

> [!TIP]
> Em produção on-premise, recomenda-se o uso de um servidor Nginx ou Apache como **Proxy Reverso** na frente deste container para gerenciar o certificado SSL (HTTPS).
