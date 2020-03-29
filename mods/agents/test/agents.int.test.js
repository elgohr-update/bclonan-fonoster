const Agents = require('../src/agents')
const assert = require('assert')
const path = require('path')

if (process.env.NODE_ENV === 'dev') {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })
}

describe('Agents Service', () => {
  let agents
  let agentRef

  before(() => {
    agents = new Agents({
      endpoint: `${process.env.APISERVER_ENDPOINT}`
    })
  })

  // The backend(routr) is failing at this
  it.skip('Create agent missing username', done => {
    agents
      .createAgent({
        name: 'John Doe',
        secret: '1234',
        domains: ['sip2.local']
      })
      .then(r => done('not good'))
      .catch(err => {
        console.log(err)
        assert.ok(err.message.includes('FAILED_PRECONDITION'))
        done()
      })
  })

  it.skip('Create agent missing domains', done => {
    agents
      .createAgent({
        name: 'John Doe',
        username: 'john',
        secret: '1234'
      })
      .then(r => done('not good'))
      .catch(err => {
        assert.ok(err.message.includes('FAILED_PRECONDITION'))
        done()
      })
  })

  it.only('Create agent', done => {
    agents
      .createAgent({
        name: 'John Doe',
        username: 'john',
        secret: '1234',
        domains: ['sip2.local']
      })
      .then(agent => {
        agentRef = agent.getRef()
        assert.ok(agent.getUsername() === 'john')
        done()
      })
      .catch(e => {
          done(e)
      })
  })

  // This is not wokring either
  it.skip('Agent already exist', done => {
    agents
      .createAgent({
        name: 'John Doe',
        username: 'john',
        secret: '1234',
        domains: ['sip2.local']
      })
      .then(r => done('not good'))
      .catch(err => {
        assert.ok(err.message.includes('FAILED_PRECONDITION'))
        done()
      })
  })

  it.only('List agents', done => {
    agents
      .listAgents({ pageSize: 10, pageToken: '1', view: 0 })
      .then(result => {
        assert.ok(result.getAgentsList().length > 0)
        done()
      })
      .catch(err => done(err))
  })

  it.only('Get agent by reference', done => {
    agents
      .getAgent(agentRef)
      .then(agent => {
        assert.ok(agent.getRef() === agentRef)
        done()
      })
      .catch(err => done(err))
  })

  it.only('Update agent', done => {
    const agent = {
      ref: agentRef,
      name: 'John Doe',
      secret: '1234'
    }

    agents
      .updateAgent(agent)
      .then(agentFromDB => {
        assert.ok(agent.ref === agentFromDB.getRef())
        done()
      })
      .catch(err => done(err))
  })

  it.only('Delete agent', done => {
    agents
      .deleteAgent(agentRef)
      .then(() => done())
      .catch(err => done(err))
  })

  it.only('Agent reference does not exist', done => {
    agents
      .deleteAgent('1234')
      .then(() => done('not good'))
      .catch(err => {
        assert.ok(err.message.includes('NOT_FOUND'))
        done()
      })
  })

})
