const { default: axios } = require('axios')
const axiosCookieJarSupport = require('axios-cookiejar-support').default
const tough = require('tough-cookie')
const { DOMCrawler } = require('./dom')
const qs = require('qs')

/** axios Cookie Jar Support */
axiosCookieJarSupport(axios)
const cookieJar = new tough.CookieJar();

/** axios Config C */
axios.defaults.jar = cookieJar
axios.defaults.withCredentials = true

/** Vehicle Class for fetching details */
class Vehicle {
  reg = null
  url = 'https://parivahan.gov.in/rcdlstatus/?pur_cd=102'
  tableSelector = 'table.table.table-responsive.table-striped.table-condensed'

  constructor (reg) {
    this.reg = reg
  }

  async getPage () {
    return await axios.get(this.url)
  }

  async getPostFields () {
    let { data: html } = await this.getPage()
    let state = this.reg.substr(0, 4)
    let crawler = new DOMCrawler(html)
    return {
      'javax.faces.partial.ajax': 'true',
      'javax.faces.source': 'form_rcdl:j_idt43',
      'javax.faces.partial.execute': '@all',
      'javax.faces.partial.render': 'form_rcdl:pnl_show form_rcdl:pg_show form_rcdl:rcdl_pnl',
      'form_rcdl:j_idt43': 'form_rcdl:j_idt43',
      'form_rcdl': 'form_rcdl',
      'form_rcdl:tf_reg_no1': state,
      'form_rcdl:tf_reg_no2': this.reg.replace(state, ''),
      'javax.faces.ViewState': crawler.get('input[name="javax.faces.ViewState"]').val()
    }
  }

  async getDetails () {
    try {
      let postFields = await this.getPostFields()
      let { data } = await axios.post(this.url, qs.stringify(postFields))
      this.crawler = new DOMCrawler(data)
      if (!this.isResultFound(data)) {
        return { error: 'No results found' }
      }
      let result = this.getFormattedResult()
      if (!Object.keys(result).length) {
        throw 'Error'
      }
      return result
    } catch (err) {
      return { error: 'Something went wrong.' }
    }
  }

  isResultFound (html) {
    return !html.includes('Please check the number')
  }

  getFormattedResult () {
    let result = {}
    this.crawler.get(`${this.tableSelector} tr`).each((index, row) => {
      this.crawler.get(row).find('td:nth-child(odd)').each((index, tableData) => {
        let $tableData = this.crawler.get(tableData)
        let column = $tableData.text().trim()
        result[column] = $tableData.next().text().trim()
      })
    })
    return result
  }
}

module.exports = Vehicle
