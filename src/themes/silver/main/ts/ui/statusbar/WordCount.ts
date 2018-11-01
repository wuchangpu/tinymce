import { Replacing, GuiFactory, SimpleSpec, Behaviour, Representing, AddEventsBehaviour, AlloyEvents, NativeEvents } from '@ephox/alloy';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { Editor } from 'tinymce/core/api/Editor';

const enum WordCountMode {
  Words = 'words',
  Characters = 'characters'
}

export const renderWordCount = (editor: Editor, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {
  const replaceCountText = (comp, count, mode) => Replacing.set(comp, [ GuiFactory.text(providersBackstage.translate(['{0} ' + mode, count[mode]])) ]);
  return {
    dom: {
      tag: 'span',
      classes: [ 'tox-statusbar__wordcount' ]
    },
    components: [ ],
    behaviours: Behaviour.derive([
      Replacing.config({ }),
      Representing.config({
        store: {
          mode: 'memory',
          initialValue: {
            mode: WordCountMode.Words,
            count: { words: 0, characters: 0 }
          }
        }
      }),
      AddEventsBehaviour.config('wordcount-events', [
        AlloyEvents.run(NativeEvents.click(), (comp) => {
          const currentVal = Representing.getValue(comp);
          const newMode = currentVal.mode === WordCountMode.Words ? WordCountMode.Characters : WordCountMode.Words;
          Representing.setValue(comp, { mode: newMode, count: currentVal.count });
          replaceCountText(comp, currentVal.count, newMode);
        }),
        AlloyEvents.runOnAttached((comp) => {
          editor.on('wordCountUpdate', (e) => {
            const { mode } = Representing.getValue(comp);
            Representing.setValue(comp, { mode, count: e.wordCount });
            replaceCountText(comp, e.wordCount, mode);
          });
        })
      ])
    ])
  };
};