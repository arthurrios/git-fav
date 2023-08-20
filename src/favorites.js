import { GithubUser } from "./github-user.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()

  }
  
  load() {
    this.entries = JSON.parse(localStorage.getItem
      ('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {

      const userAlreadyInList = this.entries.find(entry => entry.login === username)

      if (userAlreadyInList) {
        throw new Error('Usuário já cadastrado')
      }
    
      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]

    } catch (error) {
      alert(error.message)
    }

    this.update()
    this.save()
   
  }

  delete(user) {
    this.entries = this.entries.filter(entry => entry.login !== user.login)
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')
    this.table = this.root.querySelector('table')

    this.update()
    this.onadd()

  }

  onadd() {
    const addButton = this.root.querySelector('.favorite')
    const input = this.root.querySelector('#search-input')

    addButton.onclick = () => {
      const { value } = input
      this.add(value)
    }

    input.addEventListener('keypress', (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
          const { value } = input
          this.add(value)
        }
      })
    }

  update() {
    
    if (this.entries.length === 0) {
      this.removeTBody()
      const body = this.createEmptyTableBody()
      this.table.append(body)
    } else {
      this.removeAllTr()
    
      this.entries.forEach(user => {
        const row = this.createRow()
        
        row.querySelector('.user a').href = `https://github.com/${user.login}`
        row.querySelector('.user img').src = `https://github.com/${user.login}.png`
        row.querySelector('.user img').alt = `Imagem de ${user.name}`
        row.querySelector('p').textContent = user.name
        row.querySelector('span').innerHTML = `/${user.login}`
        row.querySelector('.repositories').textContent = user.public_repos
        row.querySelector('.followers').textContent = user.followers

        row.querySelector('.remove').onclick = () => {
          const isOk = confirm('Tem certeza que deseja deletar essa linha?')
          if (isOk) {
            this.delete(user)
          }
        }
  
        this.tbody.append(row)
      })
    }

   
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
    <td class="user">
      <a href="" target="_blank">
        <img src="" alt="" srcset="">
        <div>
          <p></p>
          <span></span>
        </div>
      </a>
    </td>
    <td class="repositories"></td>
    <td class="followers"></td>
    <td>
      <button class="remove">Remover</button>
    </td>
    `

    return tr
  }

  createEmptyTableBody() {
    const tbody = document.createElement('tbody')

    tbody.innerHTML = `
    <tr class="empty-table">
    <td class="empty" colspan="4">
      <img src="./assets/estrela.svg" alt="">
      <p>Nenhum favorito ainda</p>
    </td>
  </tr>
    `

    return tbody
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr')
      .forEach(tr => {
        tr.remove()
      })
  }

  removeTBody() {
    this.table.querySelector('tbody').remove()
  }
}