//TODO: Add feature: Language filter

const vscode = require("vscode")
const {
    Position,
    TextEdit
} = require('vscode')


function activate(context) {
    let onSave = vscode.workspace.onWillSaveTextDocument(function (e) {
        let languages = vscode.workspace.getConfiguration("tsignoresuper").languages
        let j = 0
        while (true) {
            if (languages[j] === e.document.languageId) {
                doAllStuff(e)
                break
            }
            j++
        }
    });

    context.subscriptions.push(onSave)
}
exports.activate = activate

function deactivate() {}
exports.deactivate = deactivate


function doAllStuff(e) {
    // Getting text from documen
    let document = e.document
    let docText = document.getText()

    // Getting last position for knowing when to stop the full search
    let stoppingPosition = docText.lastIndexOf("super()")

    // Getting all positions of all "super()" statements
    let lastChar = 0
    while (true) {
        // Break while when last search hit was found
        if (lastChar === stoppingPosition) break;

        lastChar = docText.indexOf("super()", lastChar + 1)
        let newPositionOfSuper = document.positionAt(lastChar) // Converting char to position


        // Check for if the super() above contains a //@ts-ignore
        let tsIgnoreObj = document.lineAt(new Position(newPositionOfSuper.line - 1, newPositionOfSuper.character))
        let tsIgnoreString = tsIgnoreObj.text.slice(tsIgnoreObj.firstNonWhitespaceCharacterIndex)
        if (tsIgnoreString !== "//@ts-ignore") {
            /* console.log('"//ts-ignore" found at: l:' + newPositionOfSuper.line.toString() + ", c:" + newPositionOfSuper.character.toString())
            console.log(tsIgnoreString) */

            // Do modification here ----------------
            let tempArray = []
            for (let i = 0; i < newPositionOfSuper.character; i++) {
                tempArray.push(" ")
            }
            let arrayString = tempArray.join("")
            //start // Is controlled by position if statement
            var edit = TextEdit.insert(newPositionOfSuper, "//@ts-ignore\n" + arrayString.toString())
            e.waitUntil(Promise.resolve([
                edit
            ]))
            //end
        }
    }
    // Safe to save every time ;)
    document.save()
}