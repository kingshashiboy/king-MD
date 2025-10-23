const { proto, downloadContentFromMessage, getContentType, jidDecode } = require('@whiskeysockets/baileys')
const fs = require('fs')

// 🧩 DecodeJid function fix
const decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
        const decode = jidDecode(jid) || {}
        return (decode.user && decode.server) ? `${decode.user}@${decode.server}` : jid
    } else return jid
}

const downloadMediaMessage = async(m, filename) => {
    if (m.type === 'viewOnceMessage') m.type = m.msg.type

    const types = {
        imageMessage: 'jpg',
        videoMessage: 'mp4',
        audioMessage: 'mp3',
        stickerMessage: 'webp',
        documentMessage: (m.msg.fileName?.split('.').pop() || 'bin')
    }

    if (!types[m.type]) return

    const ext = typeof types[m.type] === 'function' ? types[m.type] : types[m.type]
    const name = filename ? `${filename}.${ext}` : `undefined.${ext}`
    const stream = await downloadContentFromMessage(m.msg, m.type.replace('Message', ''))
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
    fs.writeFileSync(name, buffer)
    return fs.readFileSync(name)
}

const sms = (conn, m, store) => {
    if (!m) return m
    let M = proto.WebMessageInfo

    if (m.key) {
        m.id = m.key.id
        m.isBot = m.id?.startsWith('BAES') && m.id.length === 16
        m.isBaileys = m.id?.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = m.fromMe ? decodeJid(conn.user.id) : (m.isGroup ? decodeJid(m.key.participant) : decodeJid(m.key.remoteJid))
    }

    if (m.message) {
        m.mtype = getContentType(m.message)
        m.msg = (m.mtype === 'viewOnceMessage' ?
            m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] :
            m.message[m.mtype]
        )

        try {
            m.body = (m.mtype === 'conversation') ? m.message.conversation :
                     (m.mtype === 'imageMessage' && m.message.imageMessage.caption) ? m.message.imageMessage.caption :
                     (m.mtype === 'videoMessage' && m.message.videoMessage.caption) ? m.message.videoMessage.caption :
                     (m.mtype === 'extendedTextMessage' && m.message.extendedTextMessage.text) ? m.message.extendedTextMessage.text :
                     (m.mtype === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
                     (m.mtype === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                     (m.mtype === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
                     (m.mtype === 'messageContextInfo') ?
                        (m.message.buttonsResponseMessage?.selectedButtonId ||
                         m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
                         m.text) : ''
        } catch {
            m.body = ''
        }

        let quoted = (m.quoted = m.msg?.contextInfo ? m.msg.contextInfo.quotedMessage : null)
        m.mentionedJid = m.msg?.contextInfo ? m.msg.contextInfo.mentionedJid : []

        if (m.quoted) {
            let type = getContentType(quoted)
            m.quoted = m.quoted[type]

            if (['productMessage'].includes(type)) {
                type = getContentType(m.quoted)
                m.quoted = m.quoted[type]
            }

            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }

            m.quoted.mtype = type
            m.quoted.id = m.msg.contextInfo.stanzaId
            m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
            m.quoted.sender = decodeJid(m.msg.contextInfo.participant)
            m.quoted.fromMe = m.quoted.sender === decodeJid(conn.user.id)
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || ''
            m.quoted.mentionedJid = m.msg.contextInfo?.mentionedJid || []

            let vM = m.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            })

            const key = {
                remoteJid: m.chat,
                fromMe: false,
                id: m.quoted.id,
                participant: m.quoted.sender
            }

            m.quoted.delete = async() => conn.sendMessage(m.chat, { delete: key })
            m.forwardMessage = (jid, forceForward = true, options = {}) =>
                conn.copyNForward(jid, vM, forceForward, { contextInfo: { isForwarded: true } }, options)
            m.quoted.download = () => conn.downloadMediaMessage(m.quoted)
        }
    }

    if (m.msg?.url) m.download = () => conn.downloadMediaMessage(m.msg)
    m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || ''

    m.copy = () => sms(conn, M.fromObject(M.toObject(m)))
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
        conn.copyNForward(jid, m, forceForward, options)

    m.reply = async (text) => conn.sendMessage(m.chat, { text }, { quoted: m })
    m.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })

    return m
}

module.exports = { sms, downloadMediaMessage }
