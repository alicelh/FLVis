// initial state
const state = {
  matrixData: [{
      edges: [{
          source: '_0_0',
          target: '_1_0',
          weight: {
            server: 0.45
          }
        },
        {
          source: '_0_1',
          target: '_1_0',
          weight: {
            server: 0.95
          }
        },
        {
          source: '_0_2',
          target: '_1_1',
          weight: {
            server: 0.85
          }
        },
        {
          source: '_0_2',
          target: '_1_2',
          weight: {
            server: 0.95
          }
        }
      ],
      nodes: [{
          id: '_0_0',
          bias: {
            server: 1
          }
        },
        {
          id: '_0_1',
          bias: {
            server: 2
          }
        },
        {
          id: '_0_2',
          bias: {
            server: 1.3
          }
        }
      ]
    },
    {
      edges: [{
          source: '_1_0',
          target: '_2_0',
          weight: {
            server: 0.45
          }
        },
        {
          source: '_1_1',
          target: '_2_0',
          weight: {
            server: 0.95
          }
        },
        {
          source: '_1_2',
          target: '_2_1',
          weight: {
            server: 0.85
          }
        },
        {
          source: '_1_2',
          target: '_2_0',
          weight: {
            server: 0.95
          }
        }
      ],
      nodes: [{
          id: '_1_0',
          bias: {
            server: 0.4
          }
        },
        {
          id: '_1_1',
          bias: {
            server: 2
          }
        },
        {
          id: '_1_2',
          bias: {
            server: 1.9
          }
        }
      ]
    },
    {
      edges: [],
      nodes: [{
          id: '_2_0',
          bias: {
            server: 1
          }
        },
        {
          id: '_2_1',
          bias: {
            server: 2
          }
        }
      ]
    }
  ]
}

const getters = {}

const actions = {}

const mutations = {}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
