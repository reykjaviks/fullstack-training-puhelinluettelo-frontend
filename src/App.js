import React from 'react'
import Person from './components/Person'
import personService from './services/persons'
import './index.css'

const Otsikko = (props) => {
  return(
    <h2>{props.text}</h2>
  )
}

const Haku = (props) => {
  return(
    <div>
      Hae:
      <input
        value={props.filter}
        onChange={props.handleFilterChange}
      />
    </div>
  )
}

const Lomake = (props) => {
  return(
    <form onSubmit={props.onSubmit}>
      <div>
        nimi:
        <input
          value={props.newName}
          onChange={props.handleNameChange}
        />
      </div>
      <div>
        puhelinnumero:
        <input
          value={props.newNumber}
          onChange={props.handleNumberChange}
        />
      </div>
      <div>
        <button type="submit">lisää</button>
      </div>
    </form>
  )
}

const Listaa = (props) => {
  return(
    <table>
      <tbody>
        {props.numbersToShow.map(person =>
          <Person
            key={person.id}
            person={person}
            deleteNumber={props.deleteNumber}
           />
        )}
      </tbody>
    </table>
  )
}

const Ilmoitus = ({ message }) => {
  if (message === null) {
    return null
  }
  return (
    <div className="notif">{message}</div>
  )
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      persons: [],
      newName: '',
      newNumber: '',
      filter: '',
      notif: null
    }
  }

  // Hakee datan palvelimelta
  componentDidMount() {
    personService
      .getAll()
      .then(response => {
        this.setState({ persons: response.data })
      })
  }

  addNumber = (event) => {
    event.preventDefault()

    const names = this.state.persons.map(person => person.name)
    const nimiOnLuettelossa = names.includes(this.state.newName)
    const text = 'on jo luettelossa. Korvataanko vanha numero uudella?'
    const personObject = {
      name: this.state.newName,
      number: this.state.newNumber
    }

    // Pyytää käyttäjän lupaa korvata vanha numero uudella numerolla
    if (nimiOnLuettelossa && window.confirm(`${this.state.newName} ${text}`)) {
        const duplicate = this.state.persons.find(person => person.name === this.state.newName)
        this.updateNumber(duplicate.id, personObject)
    // Lisää nimen jos nimellä ei ole duplikaatteja
    } else if (!nimiOnLuettelossa) {
      personService
        .create(personObject)
        .then(response => {
          this.setState({
          persons: this.state.persons.concat(response.data),
          newName: '',
          newNumber: '',
          notif: `Henkilö ${personObject.name} lisättiin luetteloon`
          })
          setTimeout(() => {
            this.setState({notif: null})
          }, 4000)
        })
    // Muissa tapauksissa pyyhkii kentät
    } else {
      this.setState({
        newName: '',
        newNumber: ''
      })
    }
  }

  updateNumber = (id, personObject) => {
    const persons = this.state.persons.filter(person => person.id !== id)
    personService
      .update(id, personObject)
      .then(response => {
      // Katenoi suodatetun listan axiosin palauttaman datan kanssa
        this.setState({
          persons: persons.concat(response.data),
          notif: `Henkilön ${personObject.name} puhelinnumeroa muokattiin`
        })
        setTimeout(() => {
          this.setState({notif: null})
        }, 4000)
      })
  }

  deleteNumber = (id) => {
    if (window.confirm("Poistetaanko numero?")) {
      const deletedPerson = this.state.persons.find(person => person.id === id)
      personService
        .deleteNum(id)
        .then(response => {
          this.setState({
            persons: this.state.persons.filter(person => person.id !== id),
            notif: `Henkilö  ${deletedPerson.name} poistettiin`
          })
          setTimeout(() => {
            this.setState({notif: null})
          }, 4000)
        })
    }
  }

  handleNameChange = (event) => {
    this.setState({
      newName: event.target.value
    })
  }

  handleNumberChange = (event) => {
    this.setState({
      newNumber: event.target.value
    })
  }

  handleFilterChange = (event) => {
    this.setState({
      filter: event.target.value
    })
  }

  render() {
    const numbersToShow =
      this.state.filter ?
        this.state.persons.filter(person => person.name.toLowerCase().includes(this.state.filter.toLowerCase())) :
        this.state.persons

    return (
      <div>
        <Otsikko text={'Puhelinluettelo'} />

        <Ilmoitus message={this.state.notif} />

        <Haku
          filter={this.state.filter}
          handleFilterChange={this.handleFilterChange}
        />

        <Otsikko text={'Lisää uusi'} />

        <Lomake
          onSubmit={this.addNumber}
          newName={this.state.newName}
          handleNameChange={this.handleNameChange}
          newNumber={this.state.newNumber}
          handleNumberChange={this.handleNumberChange}
        />

        <Otsikko text='Numerot' />

        <Listaa numbersToShow={numbersToShow} deleteNumber={this.deleteNumber} />
      </div>
    )
  }
}

export default App
